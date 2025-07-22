import { Link } from 'react-router-dom';
import { FaSignInAlt, FaUserPlus, FaCalendarAlt, FaUserShield, FaLock } from 'react-icons/fa';
import Footer from '../component/Footer';
import UniversityLogo from "../assets/images/uop.png";
import CEITLogo from "../assets/images/ceit.png";
import HeroImage from "../assets/images/image.png";
import './LandingPage.css';

export default function LandingPage() {
  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      
      {/* Hero Section */}
      <header 
        className="py-5 text-center hero-section"
        style={{
          backgroundImage: `url(${HeroImage})`,
          width: '100%',
          color: 'white',
          position: 'relative',
        }}
      >
        <div className="hero-overlay"></div>

        <div className="container py-4 hero-content">
          <div className="d-flex flex-wrap justify-content-center align-items-center gap-4 mb-4">
            <img 
              src={UniversityLogo} 
              alt="University Logo" 
              className="img-fluid"
              style={{ height: '70px' }}
            />
            <img 
              src={CEITLogo} 
              alt="CEIT Logo" 
              className="img-fluid"
              style={{ height: '70px' }}
            />
          </div>

          <h1 className="display-4 fw-bold mb-3 mt-3 mt-lg-4">
            Leave Management System
          </h1>

          <p className="lead mx-auto mb-4 hero-subtext">
            Developed by <strong>CEIT</strong> for the <strong>University of Peradeniya</strong> to manage leave digitally with precision.
          </p>

          <div className="d-flex flex-column flex-sm-row justify-content-center gap-3 mt-4">
            <Link 
              to="/login" 
              className="btn btn-lg btn-gold px-4 d-flex align-items-center justify-content-center gap-2"
            >
              <FaSignInAlt />
              Access Portal
            </Link>
            <Link 
              to="/register" 
              className="btn btn-lg btn-gold px-4 d-flex align-items-center justify-content-center gap-2"
            >
              <FaUserPlus />
              New Registration
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-5 bg-offwhite">
        <div className="container py-3">
          <h2 className="text-center fw-bold text-maroon mb-5 mt-lg section-title">
            Core Features
          </h2>
          <div className="row g-4">
            {[
              {
                icon: <FaCalendarAlt className="text-maroon-light" size={36} />,
                title: "Streamlined Leave Requests",
                desc: "Easily submit and manage academic leave applications."
              },
              {
                icon: <FaUserShield className="text-maroon-light" size={36} />,
                title: "Faculty Oversight",
                desc: "Admins can review, approve or decline staff requests."
              },
              {
                icon: <FaLock className="text-maroon-light" size={36} />,
                title: "Secure & Confidential",
                desc: "University-grade data protection and confidentiality."
              }
            ].map((feature, idx) => (
              <div className="col-md-4 col-sm-6 col-12" key={idx}>
                {/* ✅ FIXED class names here */}
                <div className="card h-100 border-0 shadow-sm feature-card p-4">
                  <div className="card-body text-center">
                    <div className="mb-3">{feature.icon}</div>
                    <h5 className="text-maroon fw-semibold feature-title">{feature.title}</h5>
                    <p className="text-gray-600 feature-desc">{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-5 bg-white about-section">
        <div className="container py-3">
          <div className="row align-items-center">
            
            {/* Left: Text */}
            <div className="col-lg-6 mb-4 mb-lg-0">
              <h2 className="fw-bold text-maroon mb-3 section-title">
                University of Peradeniya
              </h2>
              <p className="lead text-secondary mb-4 section-subtitle">
                Advancing Academic Operations with Innovation
              </p>
              {/* ✅ FIXED p-md to p-4 */}
              <div className="ps-3 border-start border-4 border-gold p-4">
                <p className="text-secondary about-desc">
                  Developed by CEIT, this system represents our ongoing digital transformation in academic administration.
                </p>
                <div className="d-flex gap-2 mt-3">
                  <div className="bg-maroon" style={{ width: '36px', height: '5px', borderRadius: '4px' }}></div>
                  <div className="bg-gold" style={{ width: '36px', height: '5px', borderRadius: '4px' }}></div>
                  <div className="bg-maroon-light" style={{ width: '36px', height: '5px', borderRadius: '4px' }}></div>
                </div>
              </div>
            </div>

            {/* Right: Image */}
            <div className="col-lg-6 text-center">
              {/* ✅ FIXED mt-md to mt-4 mt-lg-0 */}
              <div className="bg-light rounded p-4 border mt-4 mt-lg-0">
                <img 
                  src={UniversityLogo} 
                  alt="University Crest" 
                  className="img-fluid mb-3"
                  style={{ height: '100px' }}
                />
                <h5 className="text-maroon fw-semibold mb-1">
                  Center for Information Technology
                </h5>
                <p className="small text-muted">
                  Empowering Education Through Technology
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}