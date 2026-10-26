import { useState, useEffect } from 'react'
import { farmerAPI, buyerAPI } from '../services/api'
import { toast } from 'react-toastify'
import PersonalDashboardCard from '../components/PersonalDashboardCard'
import { useAppThemeLanguage } from '../context/ThemeLanguageContext'

const Profile = () => {
  const { t } = useAppThemeLanguage()
  const role = localStorage.getItem('role') || 'FARMER'
  const firstName = localStorage.getItem('firstName') || 'User'
  const phone = localStorage.getItem('phone') || 'Registered Mobile'

  return (
    <div className="page-container form-page" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ width: '100%' }}>
        <div className="page-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.4rem' }}>
            {role === 'FARMER' ? '🧑‍🌾 Farmer Profile & Settings' : '🛒 Buyer Profile & Settings'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Manage your personal dashboard details, About Me bio, GPS & preferred locations, and linked bank accounts.
          </p>
        </div>

        {/* Embedded PersonalDashboardCard with immediate editing and persistence */}
        <PersonalDashboardCard role={role} />
      </div>
    </div>
  )
}

export default Profile
