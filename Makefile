# Makefile

.PHONY: test test-verbose test-coverage install-dev clean help

# Default Python and pip commands
PYTHON := python
PIP := pip

# Virtual environment
VENV := server/venv
VENV_PYTHON := $(VENV)/bin/python
VENV_PIP := $(VENV)/bin/pip

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install-dev: ## Install development dependencies
	$(VENV_PIP) install -r server/requirements.txt
	$(VENV_PIP) install -r test_requirements.txt

test: ## Run all tests
	cd $(CURDIR) && $(VENV_PYTHON) -m pytest tests/ -v

test-verbose: ## Run tests with verbose output
	cd $(CURDIR) && $(VENV_PYTHON) -m pytest tests/ -v -s

test-coverage: ## Run tests with coverage report
	cd $(CURDIR) && $(VENV_PYTHON) -m pytest tests/ --cov=server --cov-report=html --cov-report=term-missing

test-auth: ## Run only authentication tests
	cd $(CURDIR) && $(VENV_PYTHON) -m pytest tests/test_auth.py -v

test-notes: ## Run only notes tests
	cd $(CURDIR) && $(VENV_PYTHON) -m pytest tests/test_notes.py -v

test-models: ## Run only model tests
	cd $(CURDIR) && $(VENV_PYTHON) -m pytest tests/test_models.py -v

test-integration: ## Run only integration tests
	cd $(CURDIR) && $(VENV_PYTHON) -m pytest tests/test_integration.py -v

clean: ## Clean up test artifacts
	rm -rf htmlcov/
	rm -rf .coverage
	rm -rf coverage.xml
	rm -rf .pytest_cache/
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete

run-server: ## Run the development server
	cd server && $(VENV_PYTHON) app.py

lint: ## Run linting (if you have flake8 installed)
	$(VENV_PYTHON) -m flake8 server/ tests/

format: ## Format code with black (if you have black installed)
	$(VENV_PYTHON) -m black server/ tests/
