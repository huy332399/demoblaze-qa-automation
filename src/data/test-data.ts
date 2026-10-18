/**
 * Centralized test data for Login, Cart, and Order flows.
 */
export const TestData = {
  // Pre-existing stable demo credentials (or newly registered users)
  defaultUser: {
    username: process.env.TEST_USERNAME || 'demo_qa_user_2026',
    password: process.env.TEST_PASSWORD || 'Password123!',
  },

  // Invalid user scenarios for negative testing
  invalidUsers: {
    nonExistentUser: {
      username: 'non_existent_ghost_99998888@test.com',
      password: 'RandomPassword123!',
      expectedAlert: 'User does not exist.',
    },
    wrongPassword: {
      username: 'demo_qa_user_2026',
      password: 'IncorrectPassword999!',
      expectedAlert: 'Wrong password.',
    },
    emptyUsername: {
      username: '',
      password: 'ValidPassword123!',
      expectedAlert: 'Please fill out Username and Password.',
    },
    emptyPassword: {
      username: 'demo_qa_user_2026',
      password: '',
      expectedAlert: 'Please fill out Username and Password.',
    },
    emptyBoth: {
      username: '',
      password: '',
      expectedAlert: 'Please fill out Username and Password.',
    },
    specialCharUser: {
      username: "user' OR '1'='1",
      password: 'RandomPassword123!',
      expectedAlert: 'User does not exist.',
    },
  },

  // Products available in DemoBlaze catalog
  products: {
    samsungGalaxyS6: {
      id: 1,
      title: 'Samsung galaxy s6',
      price: 360,
      category: 'Phones',
    },
    nokiaLumia: {
      id: 2,
      title: 'Nokia lumia 1520',
      price: 820,
      category: 'Phones',
    },
    nexus6: {
      id: 3,
      title: 'Nexus 6',
      price: 650,
      category: 'Phones',
    },
    sonyVaioI5: {
      id: 8,
      title: 'Sony vaio i5',
      price: 790,
      category: 'Laptops',
    },
    appleMonitor: {
      id: 10,
      title: 'Apple monitor 24',
      price: 400,
      category: 'Monitors',
    },
  },

  // Expected system alert strings across features
  alerts: {
    loginMissingFields: 'Please fill out Username and Password.',
    wrongPassword: 'Wrong password.',
    userDoesNotExist: 'User does not exist.',
    userAlreadyExists: 'This user already exist.',
    signUpSuccessful: 'Sign up successful.',
    productAdded: 'Product added',
    orderMissingFields: 'Please fill out Name and Creditcard.',
  },

  // Valid Order checkout details
  orderData: {
    valid: {
      name: 'John Doe',
      country: 'United States',
      city: 'New York',
      card: '4532758920194821',
      month: '11',
      year: '2027',
    },
    missingName: {
      name: '',
      country: 'United States',
      city: 'New York',
      card: '4532758920194821',
      month: '11',
      year: '2027',
    },
    missingCard: {
      name: 'John Doe',
      country: 'United States',
      city: 'New York',
      card: '',
      month: '11',
      year: '2027',
    },
  },
};
