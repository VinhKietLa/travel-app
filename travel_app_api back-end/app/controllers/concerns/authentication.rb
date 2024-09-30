# app/controllers/concerns/authentication.rb
module Authentication
    extend ActiveSupport::Concern
  
    included do
      before_action :authenticate_request
    end
  
    private
  
    def authenticate_request
      header = request.headers['Authorization']
      header = header.split(' ').last if header
      decoded = JwtService.decode(header)
      @current_user = User.find(decoded[:user_id]) if decoded
    rescue
      render json: { error: 'You must be logged in to perform this action' }, status: :unauthorized
    end
  end
  