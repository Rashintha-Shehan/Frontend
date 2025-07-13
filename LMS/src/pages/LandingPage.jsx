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
  {/* Optional overlay to darken image for better text contrast */}
  <div className="hero-overlay"></div>

  <div className="container py-4 hero-content">
    <div className="d-flex justify-content-center gap-4 mb-lg">
      <img 
        src={UniversityLogo} 
        alt="University Logo" 
        className="img-fluid" 
        style={{ height: '64px' }}
      />
      <img 
        src={CEITLogo} 
        alt="CEIT Logo" 
        className="img-fluid" 
        style={{ height: '64px' }}
      />
    </div>
    <h1 className="display-4 fw-bold mb-3 mt-lg">Leave Management System</h1>
    <p className="lead mx-auto mb-4" style={{ maxWidth: '720px', fontSize: 'var(--font-size-lg)' }}>
      Developed by <strong>CEIT</strong> for the <strong>University of Peradeniya</strong> to manage leave digitally with precision.
    </p>
    <div className="d-flex justify-content-center gap-3 mt-4">
      <Link 
        to="/login" 
        className="btn btn-lg btn-gold px-4 d-flex align-items-center gap-2"
        style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', borderRadius: '8px' }}
      >
        <FaSignInAlt />
        Access Portal
      </Link>
      <Link 
        to="/register" 
        className="btn btn-lg btn-outline-gold px-4 d-flex align-items-center gap-2"
        style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', borderRadius: '8px' }}
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
          <h2 className="text-center fw-bold text-maroon mb-5 mt-lg" style={{ fontSize: 'var(--font-size-xl)' }}>Core Features</h2>
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
              <div className="col-md-4" key={idx}>
                <div className="card h-100 border-0 shadow-sm-hover feature-card p-lg">
                  <div className="card-body text-center p-4">
                    <div className="mb-3">{feature.icon}</div>
                    <h5 className="text-maroon fw-semibold" style={{ fontSize: 'var(--font-size-lg)' }}>{feature.title}</h5>
                    <p className="text-gray-600" style={{ fontSize: 'var(--font-size-md)' }}>{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-5 bg-white">
        <div className="container py-3">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <h2 className="fw-bold text-maroon mb-3 mt-lg" style={{ fontSize: 'var(--font-size-xl)' }}>University of Peradeniya</h2>
              <p className="lead text-gray-600 mb-4" style={{ fontSize: 'var(--font-size-lg)' }}>Advancing Academic Operations with Innovation</p>
              <div className="ps-3 border-start border-4 border-gold p-md">
                <p className="text-gray-800" style={{ fontSize: 'var(--font-size-md)' }}>
                  Developed by CEIT, this system represents our ongoing digital transformation in academic administration.
                </p>
                <div className="d-flex gap-2 mt-3">
                  <div className="bg-maroon" style={{ width: '36px', height: '5px', borderRadius: '4px' }}></div>
                  <div className="bg-gold" style={{ width: '36px', height: '5px', borderRadius: '4px' }}></div>
                  <div className="bg-maroon-light" style={{ width: '36px', height: '5px', borderRadius: '4px' }}></div>
                </div>
              </div>
            </div>
            <div className="col-lg-6 text-center">
              <div className="bg-light rounded p-4 border mt-md">
                <img 
                  src={UniversityLogo} 
                  alt="University Crest" 
                  className="img-fluid mb-3"
                  style={{ height: '100px' }}
                />
                <h5 className="text-maroon fw-semibold mb-1" style={{ fontSize: 'var(--font-size-lg)' }}>Center for Information Technology</h5>
                <p className="small text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>Empowering Education Through Technology</p>
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