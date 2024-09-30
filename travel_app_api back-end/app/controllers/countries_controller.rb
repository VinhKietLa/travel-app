class CountriesController < ApplicationController
  include Authentication
  skip_before_action :authorize_request, only: [:index] # Allow public access to index action

  before_action :require_login, only: [:create, :update] # Protect these actions

  # GET /countries - retrieve all countries
  def index
  countries = Country.all
  render json: countries.as_json(include: :cities), status: :ok
  end
#GET /countries/:id
  def show
  @country = Country.find(params[:id]) # Find the country by its ID
    render json: @country, include: :cities # Include associated cities in the response
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

    # GET /countries/find_by_name/:name - find a country by name
    def find_by_name
      country = Country.find_by(name: params[:name])
  
      if country
        render json: country.as_json(include: :cities), status: :ok
      else
        render json: { error: "Country not found" }, status: :not_found
      end
    end

    def update 
      @country = Country.find(params[:id])

  if @country.update(country_params) # Update using the instance variable @country
    render json: @country, status: :ok # Return the updated country as JSON
      else
        render json: { error: "Failed to update country" }, status: :unprocessable_entity
      end
    end
  

    def visited_toggle(country)
    @country = Country.find(params[:id])

    end

  private

  # Strong parameters for country creation
  def country_params
    params.require(:country).permit(:name, :visited, :future_travel, cities_attributes: [:name, :recommendations, :highlights, :dislikes])
  end
end
