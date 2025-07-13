import UniversityLogo from "../assets/images/uop.png";
import CEITLogo from "../assets/images/ceit.png";
import './Footer.css';

export default function Footer() {
  return (
    <footer className="py-3 bg-maroon text-gold">
      <div className="container">
        <div className="row gy-3 align-items-center">

          {/* Logo & Copyright - Compact Version */}
          <div className="col-md-4 d-flex flex-column flex-md-row align-items-center gap-3">
            <div className="footer-logos">
              <img
                src={UniversityLogo}
                alt="University Logo"
              />
              <img
                src={CEITLogo}
                alt="CEIT Logo"
              />
            </div>
            <small className="footer-copyright">
              © {new Date().getFullYear()} Leave Management System · Developed by CEIT
            </small>
          </div>

          {/* Contact Info - Condensed Layout */}
          <div className="col-md-4 footer-contact">
            <div className="row gx-2 gy-1">
              <div className="col-6">
                <address>
                  <strong>Address:</strong><br />
                  Information Technology Center<br />
                  University of Peradeniya<br />
                  Peradeniya, Sri Lanka
                </address>
              </div>
              <div className="col-6">
                <address>
                  <strong>Phone:</strong><br />
                  +94 (0) 81 2384848<br />
                  +94 (0) 81 2392070<br />
                  +94 (0) 81 2392900<br />
                  Ext: 2900
                </address>
              </div>
            </div>
            <div>
              <strong>Email:</strong>{' '}
              <a href="mailto:info@ceit.pdn.ac.lk" className="text-gold">info@ceit.pdn.ac.lk</a> /{' '}
              <a href="mailto:info.ceit@gs.pdn.ac.lk" className="text-gold">info.ceit@gs.pdn.ac.lk</a><br />
              <strong>Web:</strong>{' '}
              <a href="https://www.ceit.pdn.ac.lk" target="_blank" rel="noreferrer" className="text-gold">
                www.ceit.pdn.ac.lk
              </a>
            </div>
          </div>

          {/* Functional Google Map - Compact Size */}
          <div className="col-md-4 text-center text-md-end">
            <a
              href="https://www.google.com/maps/place/Information+Technology+Center,+University+of+Peradeniya/@7.2533342,80.5857698,17z"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="IT Center location on Google Maps"
              className="d-inline-block footer-map"
            >
              <iframe
                title="IT Center Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.682725596935!2d80.58576981509696!3d7.253334194618052!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae376d14668e4d9%3A0x425d7d8ac55d2a48!2sInformation%20Technology%20Center%2C%20University%20of%20Peradeniya!5e0!3m2!1sen!2slk!4v1687849045370!5m2!1sen!2slk"
                width="240"
                height="140"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
}