import {showAlert} from './alerts';
import axios from 'axios';
const stripe = Stripe("pk_test_51RptdG1gawQKIRMvEsmUlb9ld81SeBSjRrw1swDjsNqOLW0lwKaTMEznXV4JRE5l9rvSDIYpsMCTyfv9K9woxiyG00hm8sStRL");

export const bookTour =async tourId =>{
  try
  {// 1 Get Checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);


    // 2 Create checkout form + process + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
    }
    catch(err){
    console.log(err);
      showAlert('error',err.response.data.message);
    }
}