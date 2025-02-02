/* ------------------------------------------------ */
/* ---------------- Home Page -------------------- */
/* ------------------------------------------------ */

// Import CSS styles
import '../css/App.css';

// Import necessary components
import Stat from '../components/Stats/Stats';

// Home page component rendering function
export default function Home() {
  return (
    <div>
      {/* Main content of the page */}
      <div className="mt-5 container">
        <div className="row justify-content-md-center">
          
          {/* Component responsible for handling the test and generating result graphs */}
          <div className="col-11 col-md-11 col-sm-12 col-lg-11 mt-5 mb-2 box-quizz">
            <Stat /> 
          </div>

          {/* Section for images (currently commented out) */}
          <div className="col-11 col-lg-11 col-sm-11 col-md-11 mt-5 mb-5">
            {/* <img src={imgF1} className= "space-right" width="390" height="200" alt="" /> */}
          </div>
          
          {/* Contact form component (commented out for now) */}
          {/* <div className="col col-lg-11 mt-5 mb-5">
            <Contactform />
          </div> */}
        </div>
      </div>
    </div>
  );
}
