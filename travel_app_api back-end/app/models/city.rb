require 'httparty'

class City < ApplicationRecord
  belongs_to :country
  validates :name, presence: true

  before_save :geocode_city, if: -> { latitude.blank? || longitude.blank? }

  private

  def geocode_city
    query = "#{name}, #{country.name}"
    Rails.logger.info "Geocoding query: #{query}"

    # Replace 'YOUR_API_KEY' with your actual OpenCage API key
    api_key = 'e056ce53783f4d8ca47c9d269cf2b5bf'
    response = HTTParty.get(
      "https://api.opencagedata.com/geocode/v1/json?q=#{query}&key=#{api_key}&limit=1"
    )

    Rails.logger.info "Geocoding response: #{response.parsed_response}"

    if response.success? && response.parsed_response['results'].any?
      location = response.parsed_response['results'].first['geometry']
      self.latitude = location['lat']
      self.longitude = location['lng']
      Rails.logger.info "Geocoding success: #{self.latitude}, #{self.longitude}"
    else
      Rails.logger.error "Failed to geocode city: #{name} in country: #{country.name}"
      errors.add(:base, "Unable to geocode the city location")
      throw(:abort) # Prevent saving if geocoding fails
    end
  end
end
