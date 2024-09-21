class CountriesController < ApplicationController

  def create
    Rails.logger.info "Received params: #{params.inspect}"
    country = Country.new(country_params)

    if country.save
      render json: country.as_json(include: :cities), status: :created
    else
      render json: { errors: country.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # GET /countries
  def index
    countries = Country.includes(:cities).all # Fetch countries with cities
    render json: countries.as_json(include: :cities) # Include cities in the JSON response
  end

  # GET /countries/:id
  def show
    country = Country.includes(:cities).find_by(id: params[:id]) # Include cities
    if country
      render json: country.as_json(include: :cities)
    else
      render json: { error: "Country not found" }, status: 404
    end
  end

  def update

    Rails.logger.info "Update request for country with ID: #{params[:id]} and params: #{params.inspect}"

    country = Country.find_by(id: params[:id])
    
    if country
      if country.update(country_params)
        render json: country.as_json(include: :cities)
      else
        render json: { errors: country.errors.full_messages }, status: :unprocessable_entity
      end
    else
      render json: { error: "Country not found" }, status: 404
    end
  end
  
  private
  
  def country_params
    params.require(:country).permit(
      :id, 
      :name, 
      :visited, 
      :future_travel, 
      cities_attributes: [:id, :name, :recommendations, :highlights, :dislikes, :_destroy]
    )
  end
  
end
