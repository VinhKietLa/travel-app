class SessionsController < ApplicationController
  skip_before_action :authorize_request, only: [:create]

  def create
    Rails.logger.debug "Login attempt with username: #{params[:username]}"

    @user = User.find_by(username: params[:username])

    if @user && @user.authenticate(params[:password])
      Rails.logger.debug "User authenticated successfully: #{@user.username}" # Added log
      token = JwtService.encode(user_id: @user.id)
      Rails.logger.debug "Generated token: #{token}"  # Ensure this log is added
      render json: { token: token }, status: :ok
    else
      Rails.logger.debug "Invalid username or password"
      render json: { error: 'Invalid username or password' }, status: :unauthorized
    end
  end
end
