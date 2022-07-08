export const SignupCheckups = {
  email: {
    // correct and incorrect email
    incorrect: 'test',
    correct: 'test@test.com',

    // correct and duplicate email with uppercase
    uppercaseDuplicate: 'Test@test.com',
    uppercaseCorrect: 'Test2@test.com',

    // whitespace correct and duplicate
    whitespaceDuplicate: '  Test@test.com  ',
    whitespaceCorrect: '    Test3@test.com   ',

    // test inner whitespace - incorrect email
    innerWhitespaceIncorrect: 'test @gm ail.com',

    // test boolean - incorrect email
    booleanIncorrect: true,

    // test number - incorrect email
    numberIncorrect: 1000,
  },
  password: {
    correct: 'test',
  },
  passwordCheck: {
    correct: 'test',
    incorrect: 'Test',
  },
};
