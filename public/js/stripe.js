import axios from 'axios';
// import { loadStripe } from '@stripe/stripe-js';

export const bookTour = async tourId => {
  // const stripe = await loadStripe( // not work
  //   'pk_test_51MjaekCy03lozp09d8LUSek6LVLUrrVt2Coep31qWETsv8NKJ2IcaYU3pkC2vCnnlyPVybB05OMnnkh2WlL4P4IL00T6SxFL9w'
  // );

  // const stripe = await Stripe(
  //   //not work
  //   'pk_test_51MjaekCy03lozp09d8LUSek6LVLUrrVt2Coep31qWETsv8NKJ2IcaYU3pkC2vCnnlyPVybB05OMnnkh2WlL4P4IL00T6SxFL9w'
  // );

  //1) get checkout from endpoint api
  try {
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    window.location.replace(session.data.session.url);
    // await stripe.redirectToCheckout({
    //   sessionId: session.data.session.id
    // });
  } catch (error) {
    console.error(error);
  }

  //2) create checkout form + change credit card
};
