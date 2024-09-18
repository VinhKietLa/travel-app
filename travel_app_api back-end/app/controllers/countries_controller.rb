class CountriesController < ApplicationController
  # Hardcoded travel data
  COUNTRIES_DATA = [
    {
      id: 1,
      name: "Japan",
      visited: true,
      cities: [
        { name: "Tokyo" },
        { name: "Osaka" },
        { name: "Kyoto" }
      ],
      recommendations: "Visit Shibuya and Mt. Fuji",
      highlights: "Beautiful landscapes and culture",
      dislikes: "Crowded in some areas"
    },
    {
      id: 2,
      name: "South Korea",
      visited: false,
      cities: [{name: "Seoul"}],
      recommendations: "Visit Berlin and the Black Forest",
      highlights: "Rich history and architecture",
      dislikes: "None"
    },
    {
      id: 3,
      name: "Australia",
      visited: true,
      cities: [
        { name: "Sydney" },
        { name: "Cairns" },
        { name: "Whitsunday" }
      ],
      recommendations: "Christ the Redeemer, Copacabana beach",
      highlights: "Vibrant culture and beautiful beaches",
      dislikes: "Traffic in São Paulo"
    }
  ]

  # GET /countries
  def index
    render json: COUNTRIES_DATA
  end

  # GET /countries/:id
  def show
    country = COUNTRIES_DATA.find { |c| c[:id] == params[:id].to_i }
    if country
      render json: country
    else
      render json: { error: "Country not found" }, status: 404
    end
  end
end
