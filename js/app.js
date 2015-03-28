$(document).ready(function() {
  function calculateDashboard() {
    //Income
    var AGI = ($('#yearly-income').val() - 6200).toFixed(2);
    var netIncome = (AGI - (AGI * 0.3)).toFixed(2);

    //Budgets
    var monthlyIncome = (netIncome / 12).toFixed(2);
    var dailyIncome = (netIncome / 365.25).toFixed(2);
    var weeklyIncome = (netIncome / 52).toFixed(2);

    //Expenses
    var monthlyExpenses = $('#monthly-expenses').val();
    var dailyExpenses = ((monthlyExpenses * 12) / 365.25).toFixed(2);
    var weeklyExpenses = ((monthlyExpenses * 12) / 52).toFixed(2);

    //Savings Goals
    var monthlySavingsGoal = ($('#monthly-savings').val();
    var dailySavingsGoal = (($('#monthly-savings').val() * 12) / 365.25).toFixed(2);
    var weeklySavingsGoal = ($('#monthly-savings').val() * 52).toFixed(2);

    //Loan Balance
    var totalLoanBalance = $('#total-loan-balance').val();
    var currentLoanBalance = $('#current-loan-balance').val();
    var interestRate = $('#interest-rate').val();

    //Loan Payments
    var monthlyLoanPayments = Math.pow((currentLoanBalance * interestRate / 12) / 1 - (1 + interestRate / 12), 120);
    var dailyLoanPayments = (monthlyLoanPayments / 30);
    var weeklyLoanPayments = (monthlyLoanPayments / 4);

    //Balances
    var monthlyBalance = monthlyIncome - monthlyExpenses - monthlyLoanPayments - monthlySavingsGoal;
    var dailyBudget = dailyIncome - dailyExpenses - dailyLoanPayments - dailySavingsGoal;
    var weeklyBudget = weeklyIncome - weeklyExpenses - weeklyLoanPayments - weeklySavingsGoal;

    //Timeline
    var totalPaid = totalLoanBalance - currentLoanBalance;
    var monthsPaid = (totalPaid / monthlyLoanPayments).toFixed();
    var monthsLeftToPay = 120 - monthsPaid;

  }

  $(".dashboard-value").change(function() {
    calculateDashboard();
  });
});
