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
  end
  