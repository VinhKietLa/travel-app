class CitiesController < ApplicationController
    def index
      @country = Country.find(params[:country_id])
      @cities = @country.cities
      render json: @cities
    end
  
    def show
      @city = City.find(params[:id])
      render json: @city
    end

    def destroy
      city = City.find(params[:id]) # Find the city by its ID
  
      if city.destroy
        render json: { message: "City deleted successfully" }, status: :ok
      else
        render json: { error: "Failed to delete city" }, status: :unprocessable_entity
      end
    end
  end
  