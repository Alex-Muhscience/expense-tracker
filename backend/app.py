import logging
import os
from datetime import datetime
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_sqlalchemy import SQLAlchemy
from flask_talisman import Talisman
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from sqlalchemy.sql import text
from werkzeug.security import generate_password_hash, check_password_hash

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
logging.basicConfig(level=getattr(logging, LOG_LEVEL.upper()))
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": os.getenv('CORS_ORIGINS', "*"), "allow_headers": ["Content-Type", "Authorization"]}})

# Database configuration
if os.getenv('USE_MYSQL'):
    # MySQL configuration for production
    app.config['SQLALCHEMY_DATABASE_URI'] = (
        f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@"
        f"{os.getenv('DB_HOST')}:{os.getenv('DB_PORT', '3306')}/{os.getenv('DB_NAME')}?"
        f"charset=utf8mb4"
    )
else:
    # SQLite configuration for local development
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///expense_tracker.db'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db = SQLAlchemy(app)
jwt = JWTManager(app)

# Security headers
Talisman(app)

# Rate limiting
limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)
limiter.init_app(app)

app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_pre_ping': True,
    'pool_recycle': 3600,
    'pool_size': 10,
    'max_overflow': 20
}
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 3600  # 1 hour expiration


# Initialize extensions
db = SQLAlchemy(app)
jwt = JWTManager(app)
limiter = Limiter(key_func=get_remote_address)
limiter.init_app(app)
talisman = Talisman(app)


# JWT error handlers
@jwt.invalid_token_loader
def invalid_token_callback(error):
    logger.error(f"Invalid JWT token: {str(error)}")
    return jsonify({"error": "Invalid token", "details": str(error)}), 401



@jwt.unauthorized_loader
def unauthorized_callback(error):
    logger.error(f"Missing JWT token: {str(error)}")
    return jsonify({"error": "Missing token", "details": str(error)}), 401


# Models
class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password = db.Column(db.String(256), nullable=False)
    expenses = db.relationship('Expense', backref='user', lazy=True)


class Expense(db.Model):
    __tablename__ = 'expenses'

    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)


class Budget(db.Model):
    __tablename__ = 'budgets'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    monthly_budget = db.Column(db.Float, nullable=False)
    year = db.Column(db.Integer, nullable=False)
    month = db.Column(db.Integer, nullable=False)

    __table_args__ = (db.UniqueConstraint('user_id', 'category', 'year', 'month', name='unique_user_category_month'),)


class Income(db.Model):
    __tablename__ = 'incomes'

    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    source = db.Column(db.String(100), nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)


class Category(db.Model):
    __tablename__ = 'categories'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Recurring(db.Model):
    __tablename__ = 'recurrings'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    frequency = db.Column(db.String(20), nullable=False)  # 'monthly', 'weekly', 'yearly'
    start_date = db.Column(db.Date, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


# Initialize database tables
with app.app_context():
    try:
        db.create_all()
        logger.info("Database tables created successfully")
        # Debug schema
        if os.getenv('USE_MYSQL'):
            result = db.session.execute(text("DESCRIBE expenses")).fetchall()
        else:
            result = db.session.execute(text("PRAGMA table_info(expenses)")).fetchall()
        logger.debug(f"Expenses table schema: {result}")
    except Exception as e:
        logger.error(f"Error creating database tables: {str(e)}")


# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    try:
        db.session.execute(text('SELECT 1'))
        logger.debug("Database connection successful")
        return jsonify({"status": "healthy"}), 200
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}", exc_info=True)
        return jsonify({"status": "unhealthy", "error": str(e)}), 500


# Test endpoint
@app.route('/api/test', methods=['GET'])
def test_endpoint():
    return jsonify({"status": "success", "message": "API is working!"})


# User registration endpoint
@limiter.limit("5 per minute")
@app.route('/api/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'preflight'}), 200

    logger.debug(f"Received Content-Type: {request.content_type}")
    if not request.content_type or not request.content_type.startswith('application/json'):
        return jsonify({"error": "Content-Type must be application/json"}), 415

    try:
        data = request.get_json(force=True, silent=True)
        if data is None:
            return jsonify({"error": "Invalid or missing JSON data"}), 400

        logger.debug(f"Received data: {data}")
        email = data.get('email')
        password = data.get('password')

        if not all([email, password]):
            return jsonify({"error": "Email and password required"}), 400

        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Email already registered"}), 400

        new_user = User(
            email=email,
            password=generate_password_hash(password)
        )
        db.session.add(new_user)
        db.session.commit()
        logger.debug(f"User created with email: {email}")

        return jsonify({"message": "User created successfully"}), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"Registration error: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error", "details": str(e)}), 500


# User login endpoint
@limiter.limit("5 per minute")
@app.route('/api/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'preflight'}), 200

    logger.debug(f"Received Content-Type: {request.content_type}")
    if not request.content_type or not request.content_type.startswith('application/json'):
        return jsonify({"error": "Content-Type must be application/json"}), 415

    try:
        data = request.get_json(force=True, silent=True)
        if data is None:
            return jsonify({"error": "Invalid or missing JSON data"}), 400

        email = data.get('email')
        password = data.get('password')

        if not all([email, password]):
            return jsonify({"error": "Email and password required"}), 400

        user = User.query.filter_by(email=email).first()

        if not user or not check_password_hash(user.password, password):
            return jsonify({"error": "Invalid credentials"}), 401

        access_token = create_access_token(identity=str(user.id))
        logger.debug(f"Login successful for user: {email}, token: {access_token}")
        return jsonify(access_token=access_token), 200

    except Exception as e:
        logger.error(f"Login error: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500


# Expense creation and retrieval endpoint
@app.route('/api/expenses', methods=['GET', 'POST', 'OPTIONS'])
@jwt_required()
def expenses():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'preflight'}), 200

    logger.debug(f"Received Authorization header: {request.headers.get('Authorization')}")
    try:
        current_user_id = get_jwt_identity()
        logger.debug(f"Authenticated user ID: {current_user_id}")
    except Exception as e:
        logger.error(f"JWT authentication error: {str(e)}", exc_info=True)
        return jsonify({"error": "Invalid or missing token", "details": str(e)}), 401

    if request.method == 'GET':
        logger.debug(f"Processing GET request for user {current_user_id}")
        expenses = Expense.query.filter_by(user_id=int(current_user_id)).all()
        logger.debug(f"Fetched {len(expenses)} expenses for user {current_user_id}")
        return jsonify([{
            'id': e.id,
            'amount': e.amount,
            'category': e.category,
            'date': e.date.strftime('%Y-%m-%d')
        } for e in expenses]), 200

    elif request.method == 'POST':
        data = request.get_json()
        logger.debug(f"Received POST data: {data}")
        try:
            amount = float(data['amount'])
            category = data['category']
            date = datetime.strptime(data['date'], '%Y-%m-%d')

            expense = Expense(
                amount=amount,
                category=category,
                date=date,
                user_id=int(current_user_id)
            )

            db.session.add(expense)
            db.session.commit()
            logger.debug(f"Expense created: {expense.id}")

            return jsonify({
                'message': 'Expense added successfully',
                'expense': {
                    'id': expense.id,
                    'amount': expense.amount,
                    'category': expense.category,
                    'date': expense.date.strftime('%Y-%m-%d')
                }
            }), 201

        except ValueError:
            return jsonify({'error': 'Invalid data format'}), 400
        except KeyError:
            return jsonify({'error': 'Missing required fields'}), 400
        except Exception as e:
            db.session.rollback()
            logger.error(f"Expense creation error: {str(e)}", exc_info=True)
            return jsonify({"error": str(e)}), 500

# Edit expense endpoint
@app.route('/api/expenses/<int:expense_id>', methods=['PUT', 'OPTIONS'])
@jwt_required()
def edit_expense(expense_id):
    if request.method == 'OPTIONS':
        return jsonify({'status': 'preflight'}), 200

    try:
        current_user_id = get_jwt_identity()
        expense = Expense.query.filter_by(id=expense_id, user_id=int(current_user_id)).first()

        if not expense:
            return jsonify({"error": "Expense not found"}), 404

        data = request.get_json()
        amount = float(data.get('amount', expense.amount))
        category = data.get('category', expense.category)
        date_str = data.get('date', expense.date.strftime('%Y-%m-%d'))
        date = datetime.strptime(date_str, '%Y-%m-%d')

        expense.amount = amount
        expense.category = category
        expense.date = date

        db.session.commit()
        logger.debug(f"Expense updated: {expense.id}")

        return jsonify({
            'message': 'Expense updated successfully',
            'expense': {
                'id': expense.id,
                'amount': expense.amount,
                'category': expense.category,
                'date': expense.date.strftime('%Y-%m-%d')
            }
        }), 200

    except ValueError:
        return jsonify({'error': 'Invalid data format'}), 400
    except Exception as e:
        db.session.rollback()
        logger.error(f"Expense update error: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

# Delete expense endpoint
@app.route('/api/expenses/<int:expense_id>', methods=['DELETE', 'OPTIONS'])
@jwt_required()
def delete_expense(expense_id):
    if request.method == 'OPTIONS':
        return jsonify({'status': 'preflight'}), 200

    try:
        current_user_id = get_jwt_identity()
        expense = Expense.query.filter_by(id=expense_id, user_id=int(current_user_id)).first()

        if not expense:
            return jsonify({"error": "Expense not found"}), 404

        db.session.delete(expense)
        db.session.commit()
        logger.debug(f"Expense deleted: {expense_id}")

        return jsonify({'message': 'Expense deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"Expense deletion error: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

# Budget management endpoints
@app.route('/api/budgets', methods=['GET', 'POST', 'OPTIONS'])
@jwt_required()
def budgets():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'preflight'}), 200

    try:
        current_user_id = get_jwt_identity()
        now = datetime.now()
        current_year = now.year
        current_month = now.month

        if request.method == 'GET':
            budgets = Budget.query.filter_by(user_id=int(current_user_id), year=current_year, month=current_month).all()
            return jsonify([{
                'id': b.id,
                'category': b.category,
                'monthly_budget': b.monthly_budget,
                'year': b.year,
                'month': b.month
            } for b in budgets]), 200

        elif request.method == 'POST':
            data = request.get_json()
            category = data['category']
            monthly_budget = float(data['monthly_budget'])

            # Check if budget exists for this category and month
            existing_budget = Budget.query.filter_by(
                user_id=int(current_user_id),
                category=category,
                year=current_year,
                month=current_month
            ).first()

            if existing_budget:
                existing_budget.monthly_budget = monthly_budget
                db.session.commit()
                return jsonify({
                    'message': 'Budget updated successfully',
                    'budget': {
                        'id': existing_budget.id,
                        'category': existing_budget.category,
                        'monthly_budget': existing_budget.monthly_budget
                    }
                }), 200
            else:
                budget = Budget(
                    user_id=int(current_user_id),
                    category=category,
                    monthly_budget=monthly_budget,
                    year=current_year,
                    month=current_month
                )
                db.session.add(budget)
                db.session.commit()
                return jsonify({
                    'message': 'Budget set successfully',
                    'budget': {
                        'id': budget.id,
                        'category': budget.category,
                        'monthly_budget': budget.monthly_budget
                    }
                }), 201

    except ValueError:
        return jsonify({'error': 'Invalid data format'}), 400
    except KeyError:
        return jsonify({'error': 'Missing required fields'}), 400
    except Exception as e:
        db.session.rollback()
        logger.error(f"Budget operation error: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

# Income management endpoints
@app.route('/api/incomes', methods=['GET', 'POST', 'OPTIONS'])
@jwt_required()
def incomes():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'preflight'}), 200

    try:
        current_user_id = get_jwt_identity()

        if request.method == 'GET':
            incomes = Income.query.filter_by(user_id=int(current_user_id)).all()
            return jsonify([{
                'id': i.id,
                'amount': i.amount,
                'source': i.source,
                'date': i.date.strftime('%Y-%m-%d')
            } for i in incomes]), 200

        elif request.method == 'POST':
            data = request.get_json()
            amount = float(data['amount'])
            source = data['source']
            date = datetime.strptime(data['date'], '%Y-%m-%d')

            income = Income(
                amount=amount,
                source=source,
                date=date,
                user_id=int(current_user_id)
            )

            db.session.add(income)
            db.session.commit()
            logger.debug(f"Income created: {income.id}")

            return jsonify({
                'message': 'Income added successfully',
                'income': {
                    'id': income.id,
                    'amount': income.amount,
                    'source': income.source,
                    'date': income.date.strftime('%Y-%m-%d')
                }
            }), 201

    except ValueError:
        return jsonify({'error': 'Invalid data format'}), 400
    except KeyError:
        return jsonify({'error': 'Missing required fields'}), 400
    except Exception as e:
        db.session.rollback()
        logger.error(f"Income creation error: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/api/incomes/<int:income_id>', methods=['PUT', 'DELETE', 'OPTIONS'])
@jwt_required()
def manage_income(income_id):
    if request.method == 'OPTIONS':
        return jsonify({'status': 'preflight'}), 200

    try:
        current_user_id = get_jwt_identity()
        income = Income.query.filter_by(id=income_id, user_id=int(current_user_id)).first()

        if not income:
            return jsonify({"error": "Income not found"}), 404

        if request.method == 'PUT':
            data = request.get_json()
            amount = float(data.get('amount', income.amount))
            source = data.get('source', income.source)
            date_str = data.get('date', income.date.strftime('%Y-%m-%d'))
            date = datetime.strptime(date_str, '%Y-%m-%d')

            income.amount = amount
            income.source = source
            income.date = date

            db.session.commit()
            return jsonify({
                'message': 'Income updated successfully',
                'income': {
                    'id': income.id,
                    'amount': income.amount,
                    'source': income.source,
                    'date': income.date.strftime('%Y-%m-%d')
                }
            }), 200

        elif request.method == 'DELETE':
            db.session.delete(income)
            db.session.commit()
            return jsonify({'message': 'Income deleted successfully'}), 200

    except ValueError:
        return jsonify({'error': 'Invalid data format'}), 400
    except Exception as e:
        db.session.rollback()
        logger.error(f"Income management error: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

# CSV export endpoint
@app.route('/api/export', methods=['GET', 'OPTIONS'])
@jwt_required()
def export_expenses():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'preflight'}), 200

    try:
        current_user_id = get_jwt_identity()
        expenses = Expense.query.filter_by(user_id=int(current_user_id)).all()

        csv_data = "Amount,Category,Date\n"
        csv_data += "\n".join(
            f"{expense.amount},{expense.category},{expense.date.strftime('%Y-%m-%d')}"
            for expense in expenses
        )

        logger.debug(f"Exported {len(expenses)} expenses for user {current_user_id}")
        return csv_data, 200, {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename=expenses.csv'
        }

    except Exception as e:
        logger.error(f"Export error: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/api/recurring', methods=['GET'])
@jwt_required()
def get_recurring():
    current_user_id = get_jwt_identity()
    try:
        recurrings = Recurring.query.filter_by(user_id=current_user_id).all()
        result = []
        for recurring in recurrings:
            result.append({
                'id': recurring.id,
                'name': recurring.name,
                'amount': recurring.amount,
                'category': recurring.category,
                'frequency': recurring.frequency,
                'start_date': recurring.start_date.strftime('%Y-%m-%d'),
                'created_at': recurring.created_at.strftime('%Y-%m-%d %H:%M:%S')
            })
        return jsonify(result)
    except Exception as e:
        logger.error(f"Get recurring error: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to fetch recurring transactions"}), 500

@app.route('/api/recurring', methods=['POST'])
@jwt_required()
def add_recurring():
    current_user_id = get_jwt_identity()
    try:
        data = request.get_json()
        name = data.get('name')
        amount = data.get('amount')
        category = data.get('category')
        frequency = data.get('frequency')
        start_date = data.get('start_date')

        if not all([name, amount, category, frequency, start_date]):
            return jsonify({"error": "All fields are required"}), 400

        new_recurring = Recurring(
            name=name,
            amount=float(amount),
            category=category,
            frequency=frequency,
            start_date=datetime.strptime(start_date, '%Y-%m-%d').date(),
            user_id=current_user_id
        )
        db.session.add(new_recurring)
        db.session.commit()

        return jsonify({"message": "Recurring transaction added successfully", "id": new_recurring.id}), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Add recurring error: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to add recurring transaction"}), 500

@app.route('/api/recurring/<int:recurring_id>', methods=['PUT'])
@jwt_required()
def update_recurring(recurring_id):
    current_user_id = get_jwt_identity()
    try:
        recurring = Recurring.query.filter_by(id=recurring_id, user_id=current_user_id).first()
        if not recurring:
            return jsonify({"error": "Recurring transaction not found"}), 404

        data = request.get_json()
        if 'name' in data:
            recurring.name = data['name']
        if 'amount' in data:
            recurring.amount = float(data['amount'])
        if 'category' in data:
            recurring.category = data['category']
        if 'frequency' in data:
            recurring.frequency = data['frequency']
        if 'start_date' in data:
            recurring.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()

        db.session.commit()
        return jsonify({"message": "Recurring transaction updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Update recurring error: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to update recurring transaction"}), 500

@app.route('/api/recurring/<int:recurring_id>', methods=['DELETE'])
@jwt_required()
def delete_recurring(recurring_id):
    current_user_id = get_jwt_identity()
    try:
        recurring = Recurring.query.filter_by(id=recurring_id, user_id=current_user_id).first()
        if not recurring:
            return jsonify({"error": "Recurring transaction not found"}), 404

        db.session.delete(recurring)
        db.session.commit()
        return jsonify({"message": "Recurring transaction deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Delete recurring error: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to delete recurring transaction"}), 500

@app.route('/api/user/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    current_user_id = get_jwt_identity()
    try:
        data = request.get_json()
        current_password = data.get('currentPassword')
        new_password = data.get('newPassword')

        if not all([current_password, new_password]):
            return jsonify({"error": "Current and new password required"}), 400

        user = User.query.get(current_user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        if not check_password_hash(user.password, current_password):
            return jsonify({"error": "Current password is incorrect"}), 400

        if len(new_password) < 6:
            return jsonify({"error": "New password must be at least 6 characters"}), 400

        user.password = generate_password_hash(new_password)
        db.session.commit()

        return jsonify({"message": "Password changed successfully"}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Change password error: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to change password"}), 500

@app.route('/api/categories', methods=['GET'])
@jwt_required()
def get_categories():
    current_user_id = get_jwt_identity()
    try:
        categories = Category.query.filter_by(user_id=current_user_id).all()
        result = [{'id': cat.id, 'name': cat.name} for cat in categories]
        return jsonify(result)
    except Exception as e:
        logger.error(f"Get categories error: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to fetch categories"}), 500


@app.route('/api/categories', methods=['POST'])
@jwt_required()
def add_category():
    current_user_id = get_jwt_identity()
    try:
        data = request.get_json()
        name = data.get('name')

        if not name:
            return jsonify({"error": "Category name required"}), 400

        # Check if category already exists for user
        existing = Category.query.filter_by(user_id=current_user_id, name=name).first()
        if existing:
            return jsonify({"error": "Category already exists"}), 400

        new_category = Category(name=name, user_id=current_user_id)
        db.session.add(new_category)
        db.session.commit()

        return jsonify({"message": "Category added successfully", "id": new_category.id}), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Add category error: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to add category"}), 500


@app.route('/api/categories/<int:category_id>', methods=['DELETE'])
@jwt_required()
def delete_category(category_id):
    current_user_id = get_jwt_identity()
    try:
        category = Category.query.filter_by(id=category_id, user_id=current_user_id).first()
        if not category:
            return jsonify({"error": "Category not found"}), 404

        db.session.delete(category)
        db.session.commit()
        return jsonify({"message": "Category deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Delete category error: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to delete category"}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)