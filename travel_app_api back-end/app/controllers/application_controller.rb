class ApplicationController < ActionController::API
  before_action :authorize_request

  def current_user
    @current_user
  end

  private

  def authorize_request
    header = request.headers['Authorization']
    Rails.logger.debug "Authorization Header: #{header.inspect}" # Log the entire header for debugging
  
    if header.nil?
      Rails.logger.debug "Token missing"
      return render json: { errors: 'Token missing' }, status: :unauthorized
    end
  
    token = header.split(' ').last
    Rails.logger.debug "Extracted token: #{token}"
  
    begin
      decoded = JwtService.decode(token)
      if decoded.nil?
        Rails.logger.debug "Decoded token is nil"
        return render json: { errors: 'Invalid token' }, status: :unauthorized
      end
  
      Rails.logger.debug "Decoded token: #{decoded.inspect}" # Log the decoded token
      @current_user = User.find(decoded[:user_id])
    rescue ActiveRecord::RecordNotFound => e
      Rails.logger.debug "User not found: #{e.message}"
      render json: { errors: 'User not found' }, status: :unauthorized
    rescue JWT::DecodeError => e
      Rails.logger.debug "JWT Decode Error: #{e.message}"
      render json: { errors: 'Invalid token' }, status: :unauthorized
    end
  end
  
  
end
