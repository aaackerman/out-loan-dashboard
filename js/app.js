$(document).ready(function() {

  // ********************************
  // Interest & Pay Period Calculators
  // ********************************

  function calcInterestPaid (amountOfDebt, interestRate, monthlyPayment, additionalPayment, months) {
    var calculatedAmountOfDebt = 0;
    var calculatedInterest = calculatedAmountOfDebt;
    calculatedAmountOfDebt += Number(amountOfDebt);

    for(var i = 1; i <= months / 12 * 365; i++) {
      var dailyInterest = calculatedAmountOfDebt * (interestRate / 100) / 365.25;
      dailyInterest = Math.round(dailyInterest * 100) / 100;
      calculatedAmountOfDebt += dailyInterest;
      calculatedInterest += dailyInterest;
      if(i % 30 == 0) {
        if(calculatedAmountOfDebt > monthlyPayment) {
          calculatedAmountOfDebt -= monthlyPayment;
        } else {
          i = months / 12 * 365.25;
        }
      }
    }
    return Math.round(calculatedInterest * 100) / 100;
  }

  function calcPayPeriod(amountOfDebt, interestRate, monthlyPayment, additionalPayment) {
    var a = 1 - ((amountOfDebt * (interestRate / 100)) / ((monthlyPayment * 12) + (additionalPayment * 12)));
    var months = 12 * (-Math.log(a)) / (12 * Math.log(1 + ((interestRate / 100) / 12)));
    if(months%1 != 0) {
      months ++;
    }
    if(isNaN(months)) {
      return -1;
    } else {
      return (Math.round(months * 100) / 100).toFixed(0);
    }
  }

  function calcLoanSavings(data) {
    var getExtraPayment = $('input:radio[name=budget]:checked').val();

    switch(getExtraPayment) {
      case 'Monthly':
        var paymentTotal = parseInt(($("#loan-payments-amount").html()).substring(1), 10);
        break;
      case 'Weekly':
        var paymentTotal = (parseInt(($("#loan-payments-amount").html()).substring(1), 10) * 52) / 12;
        break;
      case 'Daily':
        var paymentTotal = (parseInt(($("#loan-payments-amount").html()).substring(1), 10) * 365.25) / 12;
        break;
    }

    $('#monthly-loan-payments').html('$' + Math.round(paymentTotal));
    var extraPayment = paymentTotal - data.monthlyLoanPayments;

    //Total Savings Time if Extra Payment
    var additionalPaymentMonths = (Math.round(calcPayPeriod(data.currentLoanBalance, data.interestRate, data.monthlyLoanPayments, extraPayment) * 100) / 100) - 1;
    var totalMonthsSaved = 120 - additionalPaymentMonths;
    var yearsSaved = Math.floor(totalMonthsSaved / 12);
    var monthsAfterYearsSaved = totalMonthsSaved % 12;

    //Time Left
    var yearsLeftInTotal = Math.floor(additionalPaymentMonths / 12);
    var monthsLeftInTotal = additionalPaymentMonths % 12;

    //Total Savings Interest if Extra
    var currentInterest = calcInterestPaid(data.currentLoanBalance, data.interestRate, data.monthlyLoanPayments, 0, 120);
    var additionalPaymentInterest = (calcInterestPaid(data.currentLoanBalance, data.interestRate, data.monthlyLoanPayments, extraPayment, additionalPaymentMonths)).toFixed(2);
    var savingsInterest = currentInterest - additionalPaymentInterest;

    $('#years-left-to-pay').html(yearsLeftInTotal);
    $('#months-left-to-pay').html(monthsLeftInTotal);
    $('#interest-left-to-pay').html("$" + additionalPaymentInterest);
  }

  // ********************************
  // Initial Data Calculations
  // ********************************

  function calcInitialLoans() {
    //Loan Balance
    var originalLoanBalance = parseInt($('#original-loan-balance').val(), 10);
    var currentLoanBalance = parseInt($('#current-loan-balance').val(), 10);
    var interestRate = parseInt($('#interest-rate').val(), 10);

    //Loan Calculations
    var interestRateFloat = interestRate * 0.01;
    var toDivide = originalLoanBalance * (interestRateFloat / 12);
    var exponent = -120;
    var base = (1 + (interestRateFloat / 12));
    var firstPaymentCalculationStep = Math.pow(base, exponent);
    var monthlyLoanPayments = Math.round(toDivide / (1 - firstPaymentCalculationStep));
    var dailyLoanPayments = (monthlyLoanPayments  * 12 / 365.25).toFixed(2);
    var weeklyLoanPayments = (monthlyLoanPayments * 12 / 52).toFixed(2);
    var initialInterest = calcInterestPaid(currentLoanBalance, interestRate, monthlyLoanPayments, 0, 120);

    //Set Monthly Loan Payment Amount
    $("#monthly-loan-payments").html("$" + monthlyLoanPayments);
    $("#interest-left-to-pay").html("$" + initialInterest);

    //Timeline
    var totalPaid = originalLoanBalance - currentLoanBalance;
    var monthsPaid = parseInt((totalPaid / monthlyLoanPayments).toFixed(0), 10);
    var monthsLeftToPay = (currentLoanBalance / monthlyLoanPayments).toFixed(0);
    var yearsLeftToPay = Math.floor(monthsLeftToPay / 12);
    var monthsAfterYearsLeftToPay = monthsLeftToPay % 12;
    $('#years-left-to-pay').html(yearsLeftToPay);
    $('#months-left-to-pay').html(monthsAfterYearsLeftToPay);

    var paymentData = {
      originalLoanBalance: originalLoanBalance,
      currentLoanBalance: currentLoanBalance,
      interestRate: interestRate,
      monthlyLoanPayments: monthlyLoanPayments,
      dailyLoanPayments: dailyLoanPayments,
      weeklyLoanPayments: weeklyLoanPayments,
    }

    return paymentData;
  }

  function calcInitialMoney() {
    //Income
    var AGI = parseInt(($('#yearly-income').val() - 6200).toFixed(2), 10);
    var netIncome = parseInt((AGI - (AGI * 0.3)).toFixed(2), 10);
    var monthlyIncome = parseInt((netIncome / 12).toFixed(2), 10);
    var dailyIncome = parseInt((netIncome / 365.25).toFixed(2), 10);
    var weeklyIncome = parseInt((netIncome / 52).toFixed(2), 10);

    //Expenses
    var monthlyExpenses = parseInt($('#monthly-spending').val(), 10);
    var dailyExpenses = parseInt(((monthlyExpenses * 12) / 365.25).toFixed(2), 10);
    var weeklyExpenses = parseInt(((monthlyExpenses * 12) / 52).toFixed(2), 10);

    //Savings
    var monthlySavingsGoal = parseInt($('#monthly-savings').val(), 10);
    var dailySavingsGoal = parseInt(((monthlySavingsGoal * 12) / 365.25).toFixed(2), 10);
    var weeklySavingsGoal = parseInt(((monthlySavingsGoal * 12) / 52).toFixed(2), 10);

    //Initial Loan Payments
    var paymentData = calcInitialLoans();

    //Initial Budgets
    var monthlyBudget = parseInt((monthlyIncome - monthlyExpenses - paymentData.monthlyLoanPayments - monthlySavingsGoal).toFixed(2), 10);
    var dailyBudget = parseInt((dailyIncome - dailyExpenses - paymentData.dailyLoanPayments - dailySavingsGoal).toFixed(2), 10);
    var weeklyBudget = parseInt((weeklyIncome - weeklyExpenses - paymentData.weeklyLoanPayments - weeklySavingsGoal).toFixed(2), 10);

    var data = {
      AGI: AGI,
      netIncome: netIncome,
      monthlyIncome: monthlyIncome,
      dailyIncome: dailyIncome,
      weeklyIncome: weeklyIncome,
      monthlyExpenses: monthlyExpenses,
      dailyExpenses: dailyExpenses,
      weeklyExpenses: weeklyExpenses,
      monthlySavingsGoal: monthlySavingsGoal,
      dailySavingsGoal: dailySavingsGoal,
      weeklySavingsGoal: weeklySavingsGoal,
      monthlyBudget: monthlyBudget,
      dailyBudget: dailyBudget,
      weeklyBudget: weeklyBudget,
      monthlyLoanPayments: paymentData.monthlyLoanPayments,
      dailyLoanPayments: paymentData.dailyLoanPayments,
      weeklyLoanPayments: paymentData.weeklyLoanPayments
    };

    return data;
  }

  function handleBudgetDisplay(budget){
    var budgetBool = (budget >= 0);
    budgetBool ? $("#budget-chart").removeClass('negative-budget') : $("#budget-chart").addClass('negative-budget');
  }

  function setInitialDataView(data){
    var budgetToShow = $('input:radio[name=budget]:checked').val();

    //Shows Data Based on Radio
    switch(budgetToShow) {
      case 'Monthly':
        //Set Budget Views
        $("#spending-amount").html("$" + data.monthlyExpenses);
        $("#loan-payments-amount").html("$" + data.monthlyLoanPayments);
        $("#savings-amount").html("$" + data.monthlySavingsGoal);
        $("#budget-chart").html("$" + data.monthlyBudget);
        handleBudgetDisplay(data.monthlyBudget);

        //Set Chart
        doughnutChart.segments[0].value = data.monthlySavingsGoal;
        doughnutChart.segments[1].value = data.monthlyLoanPayments;
        doughnutChart.segments[2].value = data.monthlyExpenses;
        doughnutChart.update();

        //Set Sliders
        $("#loan-payments-slider").slider({value: data.monthlyLoanPayments});
        $("#savings-slider").slider({value: data.monthlySavingsGoal});
        $("#spending-slider").slider({value: data.monthlyExpenses});
        break;
      case 'Weekly':
        $("#spending-amount").html("$" + data.weeklyExpenses);
        $("#loan-payments-amount").html("$" + data.weeklyLoanPayments);
        $("#savings-amount").html("$" + data.weeklySavingsGoal);
        $("#budget-chart").html("$" + data.weeklyBudget);
        handleBudgetDisplay(data.weeklyBudget);

        doughnutChart.segments[0].value = data.weeklySavingsGoal;
        doughnutChart.segments[1].value = data.weeklyLoanPayments;
        doughnutChart.segments[2].value = data.weeklyExpenses;
        doughnutChart.update();

        //Set Sliders
        $("#loan-payments-slider").slider({value: data.dailyLoanPayments});
        $("#savings-slider").slider({value: data.weeklySavingsGoal});
        $("#spending-slider").slider({value: data.weeklyExpenses});
        break;
      case 'Daily':
        //Set Budget Views
        $("#spending-amount").html("$" + data.dailyExpenses);
        $("#loan-payments-amount").html("$" + data.dailyLoanPayments);
        $("#savings-amount").html("$" + data.dailySavingsGoal);
        $("#budget-chart").html("$" + data.dailyBudget);
        handleBudgetDisplay(data.dailyBudget);

        //Set Chart
        doughnutChart.segments[0].value = data.dailySavingsGoal;
        doughnutChart.segments[1].value = data.dailyLoanPayments;
        doughnutChart.segments[2].value = data.dailyExpenses;
        doughnutChart.update();

        //Set Sliders
        $("#loan-payments-slider").slider({value: data.dailyLoanPayments});
        $("#savings-slider").slider({value: data.dailySavingsGoal});
        $("#spending-slider").slider({value: data.dailyExpenses});
        break;
      }
  }

  function setBudgetDisplay(sliderBudgetView, incomeData, loanData) {
    //Set Labels & Sliders by Time
    switch(sliderBudgetView) {
      case 'Monthly':
        $("#spending-amount").html("$" + incomeData.monthlyExpenses);
        $("#savings-amount-amount").html("$" + incomeData.monthlySavingsGoal);
        $("#loan-payments-amount").html("$" + loanData.monthlyLoanPayments);

        $("#spending-slider").slider({value: incomeData.monthlyExpenses});
        $("#savings-slider").slider({value: incomeData.monthlySavingsGoal});
        $("#loan-payments-slider").slider({value: loanData.monthlyLoanPayments});
        break;
      case 'Weekly':
        $("#spending-amount").html("$" + incomeData.weeklyExpenses);
        $("#savings-amount-amount").html("$" + incomeData.weeklySavingsGoal);
        $("#loan-payments-amount").html("$" + loanData.weeklyLoanPayments);

        $("#spending-slider").slider({value: incomeData.weeklyExpenses});
        $("#savings-slider").slider({value: incomeData.weeklySavingsGoal});
        $("#loan-payments-slider").slider({value: loanData.weeklyLoanPayments});
        break;
      case 'Daily':
        $("#spending-amount").html("$" + incomeData.dailyExpenses);
        $("#savings-amount-amount").html("$" + incomeData.dailySavingsGoal);
        $("#loan-payments-amount").html("$" + loanData.dailyLoanPayments);

        $("#spending-slider").slider({value: incomeData.dailyExpenses});
        $("#savings-slider").slider({value: incomeData.dailySavingsGoal});
        $("#loan-payments-slider").slider({value: loanData.dailyLoanPayments});
    }
  }

  // ********************************
  // Budget Calculations
  // ********************************

  function calcSliderBudget(sliderBudgetView, data) {
    var spending = parseInt(($("#spending-amount").html()).substring(1), 10);
    var savings = parseInt(($("#savings-amount").html()).substring(1), 10);
    var loans = parseInt(($("#loan-payments-amount").html()).substring(1), 10);

    switch(sliderBudgetView) {
      case 'Monthly':
        var newBudget = parseInt((data.monthlyIncome - spending - loans - savings).toFixed(2), 10);
        break;
      case 'Weekly':
        var newBudget = parseInt((data.weeklyIncome - spending - loans - savings).toFixed(2), 10);
        break;
      case 'Daily':
        var newBudget = parseInt((data.dailyIncome - spending - loans - savings).toFixed(2), 10);
    }

    return newBudget;
  }

  // ********************************
  // Watch Initial Data Changes
  // ********************************

  $(".money-value").change(function() {
    var data = calcInitialMoney();
    setInitialDataView(data);
  });

  $(".loan-value").change(function() {
    calcInitialLoans();
  });

  $(".time-period").change(function() {
    var initialBudget = calcInitialMoney();
    var initialLoans = calcInitialLoans();
    var sliderBudgetView = $('input:radio[name=budget]:checked').val();
    setBudgetDisplay(sliderBudgetView, initialBudget, initialLoans);

    var newBudget = calcSliderBudget(sliderBudgetView, initialBudget);
    $("#budget-chart").html("$" + newBudget);
    handleBudgetDisplay(newBudget);
  });

  // ********************************
  // Initialize Doughnut Chart
  // ********************************

  (function initializeDoughnutChart() {
    var data = [
        {
            value: 0,
            color: "#244C51",
            highlight: "#28575B",
            label: "Savings"
        },
        {
            value: 350,
            color: "#8EE6DB",
            highlight: "#96EDE0",
            label: "Loan Payments"
        },
        {
            value: 2200,
            color: "#F5EA14",
            highlight: "#FFEE1A",
            label: "Spending"
        }
    ];

    var options = { animationSteps : 100 };
    var ctx = document.getElementById("dashboardChart").getContext("2d");
    doughnutChart = new Chart(ctx).Doughnut(data, options);
  })();

  // ********************************
  // Sliders
  // ********************************

  $("#savings-slider").slider({
    orientation: "horizontal",
    min: 0,
    max: 5000,
    value: 0,
    slide: function(event, ui) {
      $("#savings-amount").html("$" + ui.value);
    },
    change: function(event, ui){
      var initialBudget = calcInitialMoney();
      var sliderBudgetView = $('input:radio[name=budget]:checked').val();

      doughnutChart.segments[0].value = ui.value;
      doughnutChart.update();

      var newBudget = calcSliderBudget(sliderBudgetView, initialBudget);
      $("#budget-chart").html("$" + newBudget);
      handleBudgetDisplay(newBudget);

      var initialLoans = calcInitialLoans();
      calcLoanSavings(initialLoans);
    }
  });

  $("#loan-payments-slider").slider({
    orientation: "horizontal",
    min: 0,
    max: 5000,
    value: 350,
    slide: function(event, ui) {
      $("#loan-payments-amount").html("$" + ui.value);
    },
    change: function(event, ui){
      var initialBudget = calcInitialMoney();
      var sliderBudgetView = $('input:radio[name=budget]:checked').val();

      doughnutChart.segments[1].value = ui.value;
      doughnutChart.update();

      var newBudget = calcSliderBudget(sliderBudgetView, initialBudget);
      $("#budget-chart").html("$" + newBudget);
      handleBudgetDisplay(newBudget);

      var initialLoans = calcInitialLoans();
      calcLoanSavings(initialLoans);
    }
  });

  $("#spending-slider").slider({
    orientation: "horizontal",
    min: 0,
    max: 5000,
    value: 2200,
    slide: function(event, ui) {
      $("#spending-amount").html("$" + ui.value);
    },
    change: function(event, ui){
      var initialBudget = calcInitialMoney();
      var sliderBudgetView = $('input:radio[name=budget]:checked').val();

      doughnutChart.segments[2].value = ui.value;
      doughnutChart.update();

      var newBudget = calcSliderBudget(sliderBudgetView, initialBudget);
      $("#budget-chart").html("$" + newBudget);
      handleBudgetDisplay(newBudget);

      var initialLoans = calcInitialLoans();
      calcLoanSavings(initialLoans);
    }
  });
});
