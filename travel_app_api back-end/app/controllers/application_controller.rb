class ApplicationController < ActionController::Base
    helper_method :current_user, :logged_in?
  
    # Skip CSRF protection for JSON requests (commonly used in APIs)
    protect_from_forgery unless: -> { request.format.json? }
  
    def current_user
      @current_user ||= User.find(session[:user_id]) if session[:user_id]
    end
  
    def logged_in?
      !!current_user
    end
  
    def require_login
      unless logged_in?
        render json: { error: 'You must be logged in to perform this action' }, status: :unauthorized
      end
    end
  end
  