class CountriesController < ApplicationController
  # GET /countries
  def index
    countries = Country.includes(:cities).all
    render json: countries.to_json(include: :cities)
  end

  # GET /countries/:id
  def show
    country = Country.includes(:cities).find_by(id: params[:id])
    if country
      render json: country.to_json(include: :cities)
    else
      render json: { error: "Country not found" }, status: 404
    end
  end

  def update
    country = Country.find_by(id: params[:id])
    if country.update(visited: params[:visited])
      render json: country.to_json(include: :cities)
    else
      render json: { error: "Unable to update country" }, status: 400
    end
  end
end
