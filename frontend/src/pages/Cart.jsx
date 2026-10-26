import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { orderAPI, buyerAPI } from '../services/api'
import { toast } from 'react-toastify'
import '../styles/Dashboard.css'

const PAYMENT_CHOICES = [
  {
    id: 'PHONEPE',
    name: 'PhonePe',
    icon: '📱',
    badge: 'Popular UPI',
    desc: 'Pay instantly via PhonePe UPI ID, QR code or linked mobile number',
    color: '#5f259f'
  },
  {
    id: 'GPAY_UPI',
    name: 'Google Pay (GPay) / Paytm UPI',
    icon: '⚡',
    badge: 'Instant UPI',
    desc: 'Pay directly using Google Pay, Paytm, or BHIM UPI app',
    color: '#4285f4'
  },
  {
    id: 'CARD',
    name: 'Credit / Debit Card',
    icon: '💳',
    badge: 'Best for Bulk Orders',
    desc: 'Visa, MasterCard, RuPay & Corporate Cards — Secure instant settlement with GST invoice',
    color: '#ff6f00'
  },
  {
    id: 'NET_BANKING',
    name: 'Net Banking / RTGS / NEFT',
    icon: '🏦',
    badge: 'Commercial Wholesale',
    desc: 'Direct electronic wire transfer from all major Indian banks for large mandi orders',
    color: '#0d47a1'
  },
  {
    id: 'AMAZON_PAY',
    name: 'Amazon Pay / Other Wallets',
    icon: '💰',
    badge: 'Digital Wallet',
    desc: 'Amazon Pay, Freecharge, MobiKwik and other digital wallet balances',
    color: '#ff9900'
  },
  {
    id: 'CASH_ON_DELIVERY',
    name: 'Cash on Delivery (COD)',
    icon: '💵',
    badge: 'Pay on Arrival',
    desc: 'Pay cash upon delivery verification at your designated delivery address',
    color: '#2e7d32'
  }
]

const Cart = () => {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [isBulkOrder, setIsBulkOrder] = useState(false)
  
  // Checkout form state
  const [checkoutForm, setCheckoutForm] = useState({
    deliveryAddress: '',
    deliveryCity: '',
    deliveryPincode: '',
    notes: '',
    paymentMethod: 'CASH_ON_DELIVERY',
    phonePeUpi: '9876543211@ybl',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardName: '',
    businessName: '',
    gstin: '',
    bulkLogistics: 'DIRECT_TRUCK'
  })

  const handleAutoFillSampleAddress = () => {
    setCheckoutForm(prev => ({
      ...prev,
      deliveryAddress: 'APMC Central Wholesale Market, Yard #4',
      deliveryCity: 'Pune',
      deliveryPincode: '411037',
      paymentMethod: prev.paymentMethod || 'CASH_ON_DELIVERY'
    }))
    toast.success('Sample delivery address auto-filled! 📍')
  }

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('cart') || '[]')
    setCartItems(items)
    
    // Check if total quantity qualifies for auto-suggesting bulk order
    const totalQty = items.reduce((s, it) => s + Number(it.cartQuantity || 1), 0)
    if (totalQty >= 50) {
      setIsBulkOrder(true)
    }

    // Fetch buyer profile to pre-fill address
    buyerAPI.getProfile().then(res => {
      setCheckoutForm(prev => ({
        ...prev,
        deliveryAddress: res.data.shippingAddress || prev.deliveryAddress || 'APMC Central Wholesale Market, Yard #4',
        deliveryCity: res.data.city || prev.deliveryCity || 'Pune',
        deliveryPincode: res.data.pincode || prev.deliveryPincode || '411037'
      }))
    }).catch(err => {
      // Set reasonable defaults if profile not populated
      setCheckoutForm(prev => ({
        ...prev,
        deliveryAddress: prev.deliveryAddress || 'APMC Central Wholesale Market, Yard #4',
        deliveryCity: prev.deliveryCity || 'Pune',
        deliveryPincode: prev.deliveryPincode || '411037'
      }))
    })
  }, [])

  const updateQuantity = (id, newQty) => {
    if (newQty < 1) return
    const updated = cartItems.map(item => 
      item.id === id ? { ...item, cartQuantity: newQty } : item
    )
    setCartItems(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
  }

  const removeItem = (id) => {
    const updated = cartItems.filter(item => item.id !== id)
    setCartItems(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
  }

  const handleCheckoutChange = (e) => {
    setCheckoutForm({ ...checkoutForm, [e.target.name]: e.target.value })
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    if (cartItems.length === 0) return toast.error('Cart is empty')

    if (!checkoutForm.paymentMethod) {
      return toast.warning('Please select a payment method')
    }
    
    if (checkoutForm.paymentMethod === 'CARD') {
      if (!checkoutForm.cardNumber || checkoutForm.cardNumber.replace(/\s/g, '').length < 15) {
        return toast.warning('Please enter a valid 16-digit card number for your order')
      }
      if (!checkoutForm.cardExpiry) {
        return toast.warning('Please enter card expiry date')
      }
      if (!checkoutForm.cardCvv || checkoutForm.cardCvv.length < 3) {
        return toast.warning('Please enter a valid CVV')
      }
    }

    if ((checkoutForm.paymentMethod === 'PHONEPE' || checkoutForm.paymentMethod === 'GPAY_UPI') && !checkoutForm.phonePeUpi) {
      return toast.warning('Please enter your UPI ID or mobile number')
    }

    setLoading(true)
    try {
      const address = (checkoutForm.deliveryAddress || '').trim() || 'APMC Central Wholesale Market, Yard #4'
      const city = (checkoutForm.deliveryCity || '').trim() || 'Pune'
      const pincode = (checkoutForm.deliveryPincode || '').trim() || '411037'
      const payment = checkoutForm.paymentMethod || 'CASH_ON_DELIVERY'

      const payload = {
        deliveryAddress: address,
        deliveryCity: city,
        deliveryPincode: pincode,
        notes: isBulkOrder 
          ? `[BULK WHOLESALE ORDER] Firm: ${checkoutForm.businessName || 'Wholesale Buyer'} | GSTIN: ${checkoutForm.gstin || 'N/A'} | Logistics: ${checkoutForm.bulkLogistics} | Notes: ${checkoutForm.notes}`
          : checkoutForm.notes,
        paymentMethod: payment,
        items: cartItems.map(item => ({
          cropId: item.id,
          quantity: item.cartQuantity
        }))
      }
      
      await orderAPI.place(payload)
      toast.success(isBulkOrder ? 'Bulk Commercial Order placed successfully! 📦🎉' : 'Order placed successfully! 🎉')
      localStorage.removeItem('cart')
      setCartItems([])
      navigate('/buyer/orders')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (item.pricePerUnit * item.cartQuantity), 0)
  const bulkDiscount = isBulkOrder ? subtotal * 0.10 : 0 // 10% wholesale discount for bulk orders
  const totalAmount = Math.max(0, subtotal - bulkDiscount)

  if (cartItems.length === 0) {
    return (
      <div className="page-container empty-state" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <div className="empty-cart-icon" style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🛒</div>
        <h2>Your cart is currently empty</h2>
        <p style={{ color: 'var(--text-muted)' }}>Explore crops from all over the Indian vegetable market directly from farmers.</p>
        <Link to="/crops" className="btn-primary mt-3">Browse Indian Crops</Link>
      </div>
    )
  }

  return (
    <div className="page-container cart-page" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <h1>Your Shopping Cart 🛒</h1>
        <p style={{ color: 'var(--text-muted)' }}>Review items, configure bulk wholesale logistics, and choose your preferred payment option.</p>
      </div>

      {/* Bulk Order Toggle Banner */}
      <div style={{
        background: isBulkOrder ? 'linear-gradient(90deg, #1f3a24 0%, #17281b 100%)' : '#222',
        border: `1px solid ${isBulkOrder ? 'var(--primary)' : 'var(--border-color)'}`,
        borderRadius: '12px',
        padding: '1.25rem',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>📦</span>
            <strong style={{ fontSize: '1.1rem', color: isBulkOrder ? '#81c784' : '#fff' }}>
              Bulk Order & Wholesale Mode
            </strong>
            {isBulkOrder && (
              <span style={{ background: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                10% WHOLESALE DISCOUNT ACTIVE
              </span>
            )}
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Switch to bulk order mode for truckload shipments, institutional purchasing, mandi trading, and corporate invoicing.
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={() => setIsBulkOrder(!isBulkOrder)}
            style={{
              padding: '0.6rem 1.4rem',
              borderRadius: '8px',
              border: 'none',
              background: isBulkOrder ? 'var(--primary)' : '#333',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {isBulkOrder ? '✓ Bulk Mode Enabled' : '+ Enable Bulk Order Mode'}
          </button>
        </div>
      </div>

      <div className="cart-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Cart Items Table */}
        <div className="cart-items">
          <div className="table-responsive" style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '1rem', border: '1px solid var(--border-color)' }}>
            <table className="dashboard-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Produce</th>
                  <th>Rate</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div className="cart-item-info">
                        <strong>{item.name}</strong>
                        <span className="text-sm" style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          🧑‍🌾 {item.farmer?.user?.firstName || 'Farmer'} ({item.unit})
                        </span>
                      </div>
                    </td>
                    <td>₹{Number(item.pricePerUnit).toFixed(2)} / {item.unit}</td>
                    <td>
                      <div className="qty-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button 
                          style={{ padding: '2px 8px', borderRadius: '4px', background: '#333', color: 'white', border: 'none', cursor: 'pointer' }}
                          onClick={() => updateQuantity(item.id, (Number(item.cartQuantity) || 1) - (isBulkOrder ? 10 : 1))}
                        >
                          -
                        </button>
                        <span style={{ fontWeight: 600 }}>{item.cartQuantity}</span>
                        <button 
                          style={{ padding: '2px 8px', borderRadius: '4px', background: '#333', color: 'white', border: 'none', cursor: 'pointer' }}
                          onClick={() => updateQuantity(item.id, (Number(item.cartQuantity) || 1) + (isBulkOrder ? 10 : 1))}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>₹{(Number(item.pricePerUnit) * Number(item.cartQuantity)).toFixed(2)}</td>
                    <td>
                      <button className="btn-icon-danger" onClick={() => removeItem(item.id)} title="Remove item" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Checkout Card */}
        <div className="cart-checkout">
          <div className="checkout-card" style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
              Order Summary {isBulkOrder && <span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>(Bulk Wholesale)</span>}
            </h3>
            
            <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#ccc' }}>
              <span>Items Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            {isBulkOrder && (
              <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#4caf50' }}>
                <span>Bulk Wholesale Discount (10%):</span>
                <span>- ₹{bulkDiscount.toFixed(2)}</span>
              </div>
            )}

            <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: '#ccc' }}>
              <span>Farm Freight Logistics:</span>
              <span className="text-success" style={{ color: '#4caf50' }}>{isBulkOrder ? 'Truckload Scheduled' : 'Free Standard'}</span>
            </div>

            <div className="summary-total" style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #444', paddingTop: '0.75rem', fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>
              <span>Total Payable:</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>

            <form onSubmit={handlePlaceOrder} className="checkout-form mt-4">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1.25rem 0 0.5rem 0' }}>
                <h4 style={{ margin: 0 }}>1. Delivery Destination</h4>
                <button
                  type="button"
                  onClick={handleAutoFillSampleAddress}
                  style={{
                    background: '#2e7d32',
                    color: 'white',
                    border: 'none',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  id="autofill-address-btn"
                >
                  ⚡ Quick Fill Address
                </button>
              </div>
              <div className="form-group">
                <input 
                  name="deliveryAddress" 
                  value={checkoutForm.deliveryAddress} 
                  onChange={handleCheckoutChange} 
                  placeholder="Street / Warehouse / Mandi Address" 
                  required 
                />
              </div>
              <div className="form-row" style={{ display: 'flex', gap: '0.5rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <input 
                    name="deliveryCity" 
                    value={checkoutForm.deliveryCity} 
                    onChange={handleCheckoutChange} 
                    placeholder="City" 
                    required 
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <input 
                    name="deliveryPincode" 
                    value={checkoutForm.deliveryPincode} 
                    onChange={handleCheckoutChange} 
                    placeholder="Pincode" 
                    required 
                  />
                </div>
              </div>

              {/* Bulk Specific Fields */}
              {isBulkOrder && (
                <div style={{ background: '#1c221d', padding: '1rem', borderRadius: '8px', border: '1px solid #2e4431', marginBottom: '1rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#81c784' }}>📦 Bulk Order Information</h4>
                  <div className="form-group">
                    <input 
                      name="businessName" 
                      value={checkoutForm.businessName} 
                      onChange={handleCheckoutChange} 
                      placeholder="Business / Trading Firm Name (Optional)" 
                    />
                  </div>
                  <div className="form-group">
                    <input 
                      name="gstin" 
                      value={checkoutForm.gstin} 
                      onChange={handleCheckoutChange} 
                      placeholder="GSTIN Number (Optional for Tax Invoice)" 
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.85rem', color: '#bbb' }}>Logistics Mode</label>
                    <select name="bulkLogistics" value={checkoutForm.bulkLogistics} onChange={handleCheckoutChange} style={{ background: '#2a2a2a', color: 'white', border: '1px solid #444', borderRadius: '6px', padding: '0.5rem', width: '100%' }}>
                      <option value="DIRECT_TRUCK">Full Truckload (Direct Farm Pickup to Warehouse)</option>
                      <option value="SHARED_FREIGHT">Shared Mandi Freight Transport</option>
                      <option value="COLD_CHAIN">Cold-Chain Temperature Controlled Truck</option>
                    </select>
                  </div>
                </div>
              )}

              {/* DELIVERY NOTES */}
              <div className="form-group">
                <input 
                  name="notes" 
                  value={checkoutForm.notes} 
                  onChange={handleCheckoutChange} 
                  placeholder="Special instructions / delivery notes (optional)" 
                />
              </div>

              {/* 2. PAYMENT OPTIONS AS VISUAL CHOICES (NOT DROPDOWN) */}
              <h4 style={{ margin: '1.25rem 0 0.75rem 0' }}>2. Choose Payment Method</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
                {PAYMENT_CHOICES.map(pay => {
                  const isSelected = checkoutForm.paymentMethod === pay.id
                  return (
                    <div
                      key={pay.id}
                      onClick={() => setCheckoutForm({ ...checkoutForm, paymentMethod: pay.id })}
                      style={{
                        padding: '0.85rem 1rem',
                        borderRadius: '10px',
                        border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                        background: isSelected ? 'rgba(46, 125, 50, 0.12)' : '#262626',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      id={`payment-choice-${pay.id.toLowerCase()}`}
                    >
                      {/* Custom Radio Circle */}
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: `2px solid ${isSelected ? 'var(--primary)' : '#555'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px',
                        transition: 'all 0.2s'
                      }}>
                        {isSelected && (
                          <div style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: 'var(--primary)'
                          }} />
                        )}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 600, color: isSelected ? '#c8e6c9' : 'white', fontSize: '0.95rem' }}>
                            {pay.icon} {pay.name}
                          </span>
                          <span style={{ 
                            fontSize: '0.72rem', 
                            background: isSelected ? 'rgba(46, 125, 50, 0.3)' : '#333', 
                            color: isSelected ? '#81c784' : '#999', 
                            padding: '2px 8px', 
                            borderRadius: '4px', 
                            fontWeight: 600 
                          }}>
                            {pay.badge}
                          </span>
                        </div>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {pay.desc}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Dynamic Inputs for Selected Payment Choice */}
              {checkoutForm.paymentMethod === 'PHONEPE' && (
                <div style={{ background: '#242424', padding: '1rem', borderRadius: '10px', marginBottom: '1rem', border: '1px solid #444' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>📱</span>
                    <label style={{ fontSize: '0.9rem', color: '#ccc', fontWeight: 600 }}>
                      PhonePe Payment Details
                    </label>
                  </div>
                  <input 
                    name="phonePeUpi" 
                    value={checkoutForm.phonePeUpi} 
                    onChange={handleCheckoutChange} 
                    placeholder="PhonePe UPI ID (e.g. 9876543211@ybl) or Mobile Number" 
                    required 
                    style={{ marginBottom: '6px' }}
                  />
                  <div style={{ fontSize: '0.78rem', color: '#81c784' }}>
                    ⚡ Instant PhonePe payment request will be routed upon order confirmation.
                  </div>
                </div>
              )}

              {checkoutForm.paymentMethod === 'GPAY_UPI' && (
                <div style={{ background: '#242424', padding: '1rem', borderRadius: '10px', marginBottom: '1rem', border: '1px solid #444' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>⚡</span>
                    <label style={{ fontSize: '0.9rem', color: '#ccc', fontWeight: 600 }}>
                      UPI Payment Details
                    </label>
                  </div>
                  <input 
                    name="phonePeUpi" 
                    value={checkoutForm.phonePeUpi} 
                    onChange={handleCheckoutChange} 
                    placeholder="UPI VPA (e.g. buyer@okaxis, buyer@paytm, or mobile@upi)" 
                    required 
                  />
                  <div style={{ fontSize: '0.78rem', color: '#81c784', marginTop: '4px' }}>
                    ⚡ Supports Google Pay, Paytm, BHIM, and all UPI apps.
                  </div>
                </div>
              )}

              {checkoutForm.paymentMethod === 'CARD' && (
                <div style={{ background: '#242424', padding: '1rem', borderRadius: '10px', marginBottom: '1rem', border: '1px solid #444' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.2rem' }}>💳</span>
                      <label style={{ fontSize: '0.9rem', color: '#ccc', fontWeight: 600, margin: 0 }}>
                        Card Payment {isBulkOrder && <span style={{ color: '#ffb703' }}>(Corporate/Commercial)</span>}
                      </label>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#888' }}>Visa / MC / RuPay</span>
                  </div>
                  <div className="form-group" style={{ marginBottom: '8px' }}>
                    <input 
                      name="cardName" 
                      value={checkoutForm.cardName} 
                      onChange={handleCheckoutChange} 
                      placeholder="Cardholder Name" 
                      required 
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '8px' }}>
                    <input 
                      name="cardNumber" 
                      value={checkoutForm.cardNumber} 
                      onChange={handleCheckoutChange} 
                      placeholder="Card Number (16 digits)" 
                      maxLength="19"
                      required 
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      name="cardExpiry" 
                      value={checkoutForm.cardExpiry} 
                      onChange={handleCheckoutChange} 
                      placeholder="MM/YY" 
                      style={{ flex: 1 }}
                      maxLength="5"
                      required
                    />
                    <input 
                      name="cardCvv" 
                      type="password"
                      value={checkoutForm.cardCvv} 
                      onChange={handleCheckoutChange} 
                      placeholder="CVV" 
                      style={{ flex: 1 }}
                      maxLength="4"
                      required
                    />
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#81c784', marginTop: '6px' }}>
                    🔒 Your card details are encrypted and securely processed. GST invoice provided for bulk orders.
                  </div>
                </div>
              )}

              {checkoutForm.paymentMethod === 'NET_BANKING' && (
                <div style={{ background: '#242424', padding: '1rem', borderRadius: '10px', marginBottom: '1rem', border: '1px solid #444' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>🏦</span>
                    <span style={{ fontSize: '0.9rem', color: '#ccc', fontWeight: 600 }}>
                      Wholesale Bank Wire / RTGS Details
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#bbb', lineHeight: '1.6' }}>
                    Beneficiary: AgriBridge Escrow Settlement Account<br />
                    Bank: State Bank of India | IFSC: SBIN0001234<br />
                    Proforma invoice and wire payment link will be issued immediately upon order placement.
                  </div>
                </div>
              )}

              {checkoutForm.paymentMethod === 'AMAZON_PAY' && (
                <div style={{ background: '#242424', padding: '1rem', borderRadius: '10px', marginBottom: '1rem', border: '1px solid #444' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>💰</span>
                    <span style={{ fontSize: '0.9rem', color: '#ccc', fontWeight: 600 }}>
                      Digital Wallet Payment
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#bbb' }}>
                    You'll be redirected to your selected wallet app to complete the payment securely. Supports Amazon Pay, Freecharge, and MobiKwik.
                  </div>
                </div>
              )}

              {checkoutForm.paymentMethod === 'CASH_ON_DELIVERY' && (
                <div style={{ background: '#242424', padding: '1rem', borderRadius: '10px', marginBottom: '1rem', border: '1px solid #444' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>💵</span>
                    <span style={{ fontSize: '0.9rem', color: '#ccc', fontWeight: 600 }}>
                      Cash on Delivery
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#bbb' }}>
                    Pay in cash when your order arrives. Our delivery agent will collect the payment at your doorstep upon delivery verification.
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                className="btn-primary w-100 mt-2" 
                disabled={loading || !checkoutForm.paymentMethod}
                style={{ width: '100%', padding: '0.85rem', fontSize: '1.05rem', fontWeight: 700 }}
              >
                {loading ? 'Processing Order...' : (isBulkOrder ? `Confirm Bulk Order (₹${totalAmount.toFixed(2)})` : `Place Order (₹${totalAmount.toFixed(2)})`)}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
