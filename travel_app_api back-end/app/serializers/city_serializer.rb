class CitySerializer < ActiveModel::Serializer
  attributes :id, :name, :latitude, :longitude, :recommendations, :highlights, :dislikes, :notes, :images_urls

  def images_urls
    if object.images.attached?
      object.images.map do |image|
        Rails.application.routes.url_helpers.rails_blob_url(image, only_path: true)
      end
    else
      [] # Return an empty array if no images are attached
    end
  end
end
