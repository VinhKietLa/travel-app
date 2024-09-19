class CountriesController < ApplicationController
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
    country = Country.find_by(id: params[:id])

    if country
      if params[:visited].present?
        country.update(visited: params[:visited]) # Update visited status
      end
      render json: country.as_json(include: :cities)
    else
      render json: { error: "Country not found" }, status: 404
    end
  end
end
