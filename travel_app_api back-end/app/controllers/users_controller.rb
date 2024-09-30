class UsersController < ApplicationController
    skip_before_action :authenticate_request, only: [:login]
  
    def login
      user = User.find_by(username: params[:username])
  
      if user&.authenticate(params[:password])
        token = JwtService.encode(user_id: user.id)
        render json: { token: token, user: user }, status: :ok
      else
        render json: { error: 'Invalid username or password' }, status: :unauthorized
      end
    end
  end
  