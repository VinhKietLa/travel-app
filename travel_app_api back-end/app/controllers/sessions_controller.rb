class SessionsController < ApplicationController
  skip_before_action :authorize_request, only: [:create]

  def create
    Rails.logger.debug "Login attempt with username: #{params[:username]}"

    @user = User.find_by(username: params[:username])

    if @user && @user.authenticate(params[:password])
      token = JwtService.encode(user_id: @user.id)
      Rails.logger.debug "Generated token: #{token}"  # Add this log to check if token is generated
      render json: { token: token }, status: :ok
    else
      Rails.logger.debug "Invalid login attempt"
      render json: { error: 'Invalid username or password' }, status: :unauthorized
    end
  end
end
