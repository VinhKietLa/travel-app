class LegendPositionsController < ApplicationController
  skip_before_action :authorize_request, only: [:show, :update] # Allow public access to index action

    def show
      # Assuming you only have one position saved for the legend
      legend_position = LegendPosition.first_or_create(x: 0, y: 0)
      render json: { x: legend_position.x, y: legend_position.y }
    end
  
    def update
      legend_position = LegendPosition.first_or_create
      if legend_position.update(legend_position_params)
        render json: { x: legend_position.x, y: legend_position.y }
      else
        render json: { error: 'Unable to update position' }, status: :unprocessable_entity
      end
    end
  
    private
  
    def legend_position_params
      params.require(:legend_position).permit(:x, :y)
    end
  end
  