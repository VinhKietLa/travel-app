class SessionsController < ApplicationController
  skip_before_action :authorize_request, only: [:create]

  def create
    @user = User.find_by(username: params[:username])

    if @user && @user.authenticate(params[:password])
      token = JwtService.encode(user_id: @user.id)
      render json: { token: token }, status: :ok
    else
      render json: { error: 'Invalid username or password' }, status: :unauthorized
    end
  end
end
