class TravelStatsController < ApplicationController
    skip_before_action :authorize_request, only: [:index] # Allow public access to index action

    def index
      total_countries = Country.where(visited: true).count
      total_cities = City.joins(:country).where(countries: { visited: true }).count
  
      render json: {
        total_countries_visited: total_countries,
        total_cities_visited: total_cities
      }
    end
  end
  