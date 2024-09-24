class CountriesController < ApplicationController

  # GET /countries - retrieve all countries
def index
  countries = Country.all
  render json: countries.as_json(include: :cities), status: :ok
end


  # GET /countries/find_by_name/:name - find a country by name
  def find_by_name
    country = Country.find_by(name: params[:name])

    if country
      render json: country.as_json(include: :cities), status: :ok
    else
      render json: { error: "Country not found" }, status: :not_found
    end
  end

  # POST /countries - create a new country
  def create
    country = Country.new(country_params)

    if country.save
      render json: country.as_json(include: :cities), status: :created
    else
      render json: { errors: country.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  # Strong parameters for country creation
  def country_params
    params.require(:country).permit(:name, :visited, :future_travel, cities_attributes: [:name, :recommendations, :highlights, :dislikes])
  end
end
