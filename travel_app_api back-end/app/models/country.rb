class Country < ApplicationRecord
  has_many :cities, dependent: :destroy
  accepts_nested_attributes_for :cities, allow_destroy: true

  validates :name, uniqueness: { case_sensitive: false, scope: :id }

  # Allow setting of ID
  def id=(value)
    write_attribute(:id, value) if value.present?
  end
end
