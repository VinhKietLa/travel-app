Rails.application.routes.draw do
  resources :countries do
    resources :cities, only: [:index, :show, :create, :update, :destroy]
  end
end
