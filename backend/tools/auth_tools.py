import json
from pydantic import BaseModel, Field, field_validator
from typing import Dict, Any, Optional, List
from langchain.tools import Tool
import re

class LoginInput(BaseModel):
    """Input for login tool."""
    email: str = Field(..., description="User's email")
    password: str = Field(..., description="User's password")
    
    @field_validator('email')
    @classmethod
    def email_must_be_valid(cls, v):
        if not v or not re.match(r"[^@]+@[^@]+\.[^@]+", v):
            raise ValueError("Invalid email format")
        return v
    
    @field_validator('password')
    @classmethod
    def password_must_be_valid(cls, v):
        if not v or len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return v

class LoginTool:
    """Tool for user login."""
    
    name = "login_user"
    description = "Logs in a user with the provided credentials"
    
    def run(self, params):
        """
        Execute the login process with validation.
        
        Args:
            params: Dictionary containing user credentials
        """
        # Initialize response structure
        response = {
            "success": False,
            "message": "",
            "errors": []
        }
        try:
            if isinstance(params, str):
                params = json.loads(params)

            # Validate required fields
            errors = []
            if 'email' not in params or not params.get('email'):
                errors.append("Email is required")
            if 'password' not in params or not params.get('password'):
                errors.append("Password is required")
                
            # If we have validation errors, return them
            if errors:
                response["message"] = "Login failed due to validation errors"
                response["errors"] = errors
                return response
                
            # Email format validation
            email = params.get('email')
            if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
                errors.append("Invalid email format")
                
            # Password length validation
            password = params.get('password')
            if len(password) < 8:
                errors.append("Password must be at least 8 characters long")
                
            # If we have validation errors, return them
            if errors:
                response["message"] = "Login failed due to validation errors"
                response["errors"] = errors
                return response
                
            # Actual login logic (placeholder)
            response["success"] = True
            response["message"] = f"Login successful for: {email}"
            return response
        
        except Exception as e:
            response["message"] = "An error occurred during login"
            response["errors"].append(str(e))
            return response
        
    def get_langchain_tool(self):
        """Return this tool in a format compatible with LangChain."""
        return Tool(
            name=self.name,
            description=self.description,
            func=self.run
        )

class RegisterInput(BaseModel):
    """Input for registration tool."""
    name: str = Field(..., description="User's full name")
    email: str = Field(..., description="User's email address")
    password: str = Field(..., description="Desired password")
    
    @field_validator('name')
    @classmethod
    def name_must_be_valid(cls, v):
        if not v or len(v) < 2:
            raise ValueError("Name must be at least 2 characters long")
        return v
    
    @field_validator('email')
    @classmethod
    def email_must_be_valid(cls, v):
        if not v or not re.match(r"[^@]+@[^@]+\.[^@]+", v):
            raise ValueError("Invalid email format")
        return v
    
    @field_validator('password')
    @classmethod
    def password_must_be_valid(cls, v):
        if not v or len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return v
    
class RegisterTool:
    """Tool for user registration."""
    
    name = "register_user"
    description = "Registers a new user with the provided credentials"
    
    def run(self, params):
        """
        Execute the registration process with validation.
        
        Args:
            params: Dictionary containing user registration data
        """
        # Initialize response structure
        response = {
            "success": False,
            "message": "",
            "errors": []
        }
        try:
            if isinstance(params, str):
                params = json.loads(params)


            # Validate required fields
            errors = []
            if 'name' not in params or not params.get('name'):
                errors.append("Full name is required")
            if 'email' not in params or not params.get('email'):
                errors.append("Email is required")
            if 'password' not in params or not params.get('password'):
                errors.append("Password is required")
                
            # If we have validation errors, return them
            if errors:
                response["message"] = "Registration failed due to validation errors"
                response["errors"] = errors
                return response
                
            # Name validation
            name = params.get('name')
            if len(name) < 2:
                errors.append("Name must be at least 2 characters long")
                
            # Email format validation
            email = params.get('email')
            if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
                errors.append("Invalid email format")
                
            # Password length validation
            password = params.get('password')
            if len(password) < 8:
                errors.append("Password must be at least 8 characters long")
                
            # If we have validation errors, return them
            if errors:
                response["message"] = "Registration failed due to validation errors"
                response["errors"] = errors
                return response
                
            # Actual registration logic (placeholder)
            response["success"] = True
            response["message"] = f"Registration successful for: {name} ({email})"
            return response
        
        except Exception as e:
            response["message"] = "An error occurred during registration"
            response["errors"].append(str(e))
            return response
    
    def get_langchain_tool(self):
        """Return this tool in a format compatible with LangChain."""
        return Tool(
            name=self.name,
            description=self.description,
            func=self.run
        )