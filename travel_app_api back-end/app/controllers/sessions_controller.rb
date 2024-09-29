class SessionsController < ApplicationController
  skip_before_action :verify_authenticity_token # This disables CSRF protection for APIs

  def create
    user = User.find_by(username: params[:username])

    if user && user.authenticate(params[:password])
      session[:user_id] = user.id # Store user_id in session on successful login
      render json: { message: "Logged in successfully" }
    else
      render json: { error: "Invalid credentials" }, status: :unauthorized
    end
  end

  def destroy
    session[:user_id] = nil # Clear session on logout
    render json: { message: "Logged out successfully" }
  end

  def logged_in
    if session[:user_id]
      render json: { logged_in: true }
    else
      render json: { logged_in: false }
    end
  end
end
