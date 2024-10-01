class JwtService
  SECRET_KEY = Rails.application.credentials.jwt_secret # Use jwt_secret from credentials

  def self.encode(payload, exp = 24.hours.from_now)
    payload[:exp] = exp.to_i
    JWT.encode(payload, SECRET_KEY) # Use the JWT secret key
  end

  def self.decode(token)
    decoded = JWT.decode(token, SECRET_KEY, true, { algorithm: 'HS256' })[0]
    Rails.logger.debug "Successfully decoded token: #{decoded.inspect}"
    HashWithIndifferentAccess.new(decoded)
  rescue JWT::ExpiredSignature
    Rails.logger.debug "JWT has expired"
    nil
  rescue JWT::DecodeError => e
    Rails.logger.debug "JWT Decode Error: #{e.message}"
    nil
  end
end
