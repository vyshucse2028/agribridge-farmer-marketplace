import { useNavigate } from 'react-router-dom'

/**
 * Reusable CropCard component for displaying a crop listing.
 * No "In Stock" / availability badge shown — removed per user requirement.
 * Shows crop details, price, farmer info. Buyer can add to cart if crop is available.
 */
const CropCard = ({ crop, onAddToCart, showActions = false, onEdit, onDelete }) => {
  const navigate = useNavigate()
  const role = localStorage.getItem('role')

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price)

  return (
    <div className="crop-card">
      <div className="crop-card-image">
        {crop.imageUrl ? (
          <img src={crop.imageUrl} alt={crop.name} loading="lazy" />
        ) : (
          <div className="crop-card-placeholder">
            <span>🌿</span>
          </div>
        )}
        {/* No In Stock badge — removed */}
      </div>

      <div className="crop-card-body">
        <div className="crop-card-category">
          {crop.category?.name || 'Uncategorized'}
        </div>
        <h3 className="crop-card-title">{crop.name}</h3>
        <p className="crop-card-desc">{crop.description || 'Fresh from the farm'}</p>

        <div className="crop-card-meta">
          <span className="crop-price">{formatPrice(crop.pricePerUnit)} / {crop.unit}</span>
          <span className="crop-qty">Qty: {crop.availableQuantity} {crop.unit}</span>
        </div>

        <div className="crop-card-farmer">
          🧑‍🌾 {crop.farmer?.user?.firstName} {crop.farmer?.user?.lastName}
        </div>
      </div>

      <div className="crop-card-actions">
        {role === 'BUYER' && crop.available && onAddToCart && (
          <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
            <button
              className="btn-primary"
              style={{ flex: 1 }}
              onClick={() => onAddToCart(crop)}
              id={`add-to-cart-${crop.id}`}
            >
              🛒 Add to Cart
            </button>
            <button
              style={{
                flex: 1,
                background: '#ff6f00',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                padding: '0.5rem'
              }}
              onClick={() => {
                onAddToCart(crop)
                navigate('/buyer/cart')
              }}
              id={`buy-now-${crop.id}`}
            >
              ⚡ Buy Now
            </button>
          </div>
        )}
        {showActions && (
          <>
            <button
              className="btn-secondary"
              onClick={() => onEdit && onEdit(crop)}
              id={`edit-crop-${crop.id}`}
            >
              Edit
            </button>
            <button
              className="btn-danger"
              onClick={() => onDelete && onDelete(crop.id)}
              id={`delete-crop-${crop.id}`}
            >
              Delete
            </button>
          </>
        )}
        {!role && (
          <button className="btn-primary" onClick={() => navigate('/register')}>
            Sign up to Order
          </button>
        )}
      </div>
    </div>
  )
}

export default CropCard
