class CitiesController < ApplicationController
  before_action :require_login, only: [:create, :destroy]

  def index
    @country = Country.find(params[:country_id])
    @cities = @country.cities
    render json: @cities, each_serializer: CitySerializer
  end

  def show
    @city = City.find(params[:id])
    render json: @city, serializer: CitySerializer
  end

  def create
    country = Country.find(params[:country_id]) # Find the country by its ID
    city = country.cities.build(city_params) # Create a new city associated with the country

    if city.save
      update_country_status(country) # Automatically update the country's visited status
      render json: city, serializer: CitySerializer, status: :created
    else
      render json: { error: "Failed to create city" }, status: :unprocessable_entity
    end
  end

  def destroy
    city = City.find(params[:id]) # Find the city by its ID
    if city.destroy
      update_country_status(city.country) # Automatically update the country's visited status
      render json: { message: "City deleted successfully" }, status: :ok
    else
      render json: { error: "Failed to delete city" }, status: :unprocessable_entity
    end
  end

  def update
    city = City.find(params[:id]) # Find the city by its ID

    if city.update(city_params) # Update with the permitted params
      render json: city, serializer: CitySerializer, status: :ok
    else
      render json: { error: "Failed to update city" }, status: :unprocessable_entity
    end
  end

  def update_country_status(country)
    if country.cities.any?
      country.update(visited: true) # Set visited to true (green)
    else
      country.update(visited: false) # Set visited to false (red)
    end
  end  

  def require_login
    unless logged_in?
      render json: { error: 'You must be logged in to perform this action' }, status: :unauthorized
    end
  end  
  private

  # Strong parameters to permit city attributes
  def city_params
    params.require(:city).permit(:name, :recommendations, :highlights, :dislikes, :notes, images: [])
  end
end
