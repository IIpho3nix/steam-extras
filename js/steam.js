const formatCurrency = (amount) => (amount / 100).toFixed(2);

const isNumericInput = (event) => {
  const key = event.keyCode || event.which;
  const keyChar = event.key;

  return /^\d+$/.test(keyChar) || isSpecialKey(event);
};

const isSpecialKey = (event) => {
  const key = event.keyCode || event.which;

  return (
    event.key === "ArrowLeft" ||
    event.key === "ArrowRight" ||
    event.key === "ArrowUp" ||
    event.key === "ArrowDown" ||
    event.key === "Tab" ||
    event.key === "Backspace"
  );
};

const appendNumbers = (num1, num2) =>
  parseInt(num1.toString() + num2.toString().padStart(2, "0"));

const addFunds = (amount, currency) => {
  document.getElementById("input_amount").value = amount;
  document.getElementById("input_currency").value = currency;
  document.getElementById("form_addfunds").submit();
};

const makeReadable = (num, intSep = ",", floatSep = ".") => {
  return new Intl.NumberFormat("en-US")
    .format(num)
    .replaceAll(".", floatSep)
    .replaceAll(",", intSep);
};

const backgroundFetch = (url, options) => {
  return new Promise((resolve, reject) => {
    if (typeof browser !== "undefined" && browser.runtime) {
      browser.runtime.sendMessage({ action: "fetchData", url: url, options: options }, (response) => {
        if (response && response.success) {
          resolve(response.data);
        } else {
          reject(response.error);
        }
      });
    } else if (typeof chrome !== "undefined" && chrome.runtime) {
      chrome.runtime.sendMessage({ action: "fetchData", url: url, options: options }, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError.message);
        } else if (response && response.success) {
          resolve(response.data);
        } else {
          reject(response.error);
        }
      });
    } else {
      reject("Runtime environment not supported");
    }
  });
};

const getTierColor = (tier) => {
  switch (tier) {
    case "platinum":
      return "#B0C4DE";
    case "gold":
      return "#FFD700";
    case "silver":
      return "#C0C0C0";
    case "bronze":
      return "#CD7F32";
    case "borked":
      return "#8B0000";
    default:
      return "#FFFFFF";
  }
};

const retrieveSettings = () => {
  return new Promise((resolve, reject) => {
    const settingsKeys = [
      "openInSteam",
      "addCustomFunds",
      "autoSkipAgeVerification",
      "showCurrentPlayers",
      "showProtonDBRating",
      "scrollToTop",
      "showLowest",
      "showDownloadButton",
    ];

    if (
      typeof browser !== "undefined" &&
      browser.storage &&
      browser.storage.sync
    ) {
      browser.storage.sync
        .get(settingsKeys)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    } else if (
      typeof chrome !== "undefined" &&
      chrome.storage &&
      chrome.storage.sync
    ) {
      chrome.storage.sync.get(settingsKeys, (result) => {
        resolve(result);
      });
    } else {
      reject(new Error("Browser storage API not supported"));
    }
  });
};

retrieveSettings()
  .then((settings) => {
    if (settings.openInSteam) {
      let action_menu = document.getElementById("global_action_menu");
      action_menu.innerHTML =
        `
        <div class="header_installsteam_btn header_installsteam_btn_gray">
            <a class="header_installsteam_btn_content" href="#" onclick="window.location.href = 'steam://openurl/' + window.location.href">
                Open In Steam
            </a>
        </div>
        ` + action_menu.innerHTML;
    }

    if (settings.scrollToTop) {
      const arrow = document.createElement("div");
      arrow.className = "steam-go-to-top";
      arrow.textContent = "↑";
      document.body.appendChild(arrow);

      const styles = {
        display: "none",
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "40px",
        height: "40px",
        backgroundColor: "#000",
        color: "#fff",
        fontSize: "24px",
        textAlign: "center",
        lineHeight: "40px",
        cursor: "pointer",
        opacity: "0.5",
        borderRadius: "5px",
        zIndex: "9999",
      };

      Object.assign(arrow.style, styles);

      arrow.addEventListener("click", () => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      });

      window.addEventListener("scroll", () => {
        if (window.pageYOffset > 0) {
          arrow.style.display = "block";
        } else {
          arrow.style.display = "none";
        }
      });
    }

    if (settings.showLowest) {
      if (
        window.location.href.startsWith("https://store.steampowered.com/app/")
      ) {
        let appId = window.location.href.match(/\/app\/(\d+)\//)[1];

        const currencyElement = document.querySelector(
          'meta[itemprop="priceCurrency"]'
        );
        const currency = currencyElement ? currencyElement.content : null;
        const fallback = !currency;

        let finalCurrency = currency || "USD";

        if (finalCurrency === "USD") {
          const script = document.evaluate(
            '//script[contains(text(), "EnableSearchSuggestions")]',
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
          ).singleNodeValue;

          const country = script?.textContent.match(
            /EnableSearchSuggestions\(.+?'(?<cc>[A-Z]{2})',/
          )?.groups?.cc;

          const countryToCurrency = {
            AZ: "USD-CIS",
            AM: "USD-CIS",
            BY: "USD-CIS",
            GE: "USD-CIS",
            KG: "USD-CIS",
            MD: "USD-CIS",
            TJ: "USD-CIS",
            TM: "USD-CIS",
            UZ: "USD-CIS",
            BD: "USD-SASIA",
            BT: "USD-SASIA",
            NP: "USD-SASIA",
            PK: "USD-SASIA",
            LK: "USD-SASIA",
            AR: "USD-LATAM",
            BO: "USD-LATAM",
            BZ: "USD-LATAM",
            EC: "USD-LATAM",
            GT: "USD-LATAM",
            GY: "USD-LATAM",
            HN: "USD-LATAM",
            NI: "USD-LATAM",
            PA: "USD-LATAM",
            PY: "USD-LATAM",
            SR: "USD-LATAM",
            SV: "USD-LATAM",
            VE: "USD-LATAM",
            BH: "USD-MENA",
            DZ: "USD-MENA",
            EG: "USD-MENA",
            IQ: "USD-MENA",
            JO: "USD-MENA",
            LB: "USD-MENA",
            LY: "USD-MENA",
            MA: "USD-MENA",
            OM: "USD-MENA",
            PS: "USD-MENA",
            SD: "USD-MENA",
            TN: "USD-MENA",
            TR: "USD-MENA",
            YE: "USD-MENA",
          };  

          finalCurrency = countryToCurrency[country] || finalCurrency;
        }

        let requestUrl =
          "https://steamdb.info/api/ExtensionGetPrice/?appid=" +
          appId +
          "&currency=" +
          finalCurrency;

        backgroundFetch(requestUrl, {
          credentials: "omit",
          headers: {
            Accept: "application/json",
            "X-Requested-With": "SteamDB",
          },
        })
          .then((frespone) => {
            if (frespone.success) {
              const element = document.querySelector(".game_area_purchase");

              const div = document.createElement("div");
              div.classList.add("game_area_purchase_game");

              const h1 = document.createElement("h1");

              h1.textContent =
                "Lowest recorded price: " +
                frespone.data.lowest.price +
                " at " +
                frespone.data.lowest.discount +
                "%";

              div.appendChild(h1);

              const p = document.createElement("p");
              p.innerText = "Recorded on " + frespone.data.lowest.date;
              div.appendChild(p);

              if (fallback) {
                const p2 = document.createElement("p");
                p2.innerText =
                  "Fallen back to USD since the extension wasnt able to determine the currency";
                div.appendChild(p2);
              }

              element.insertBefore(div, element.firstChild);
            }
          });
      }
    }

    if (settings.addCustomFunds) {
      if (
        window.location.href.startsWith(
          "https://store.steampowered.com/steamaccount/addfunds"
        )
      ) {
        const element = document.querySelector("a.btnv6_green_white_innerfade");

        if (element) {
          const minamount = element.getAttribute("data-amount");
          const currency = element.getAttribute("data-currency");

          const container = document.createElement("div");
          container.style.background =
            "linear-gradient(to right, rgb(44, 60, 74), rgb(87, 102, 116))";
          container.style.padding = "20px";
          container.style.borderRadius = "6px";
          container.style.boxShadow = "0px 0px 8px rgba(0, 0, 0, 0.6)";
          container.style.width = "250px";
          container.style.margin = "0 auto";
          container.style.textAlign = "center";

          const text = document.createElement("h1");
          text.innerText = "Add custom funds";

          const smallText = document.createElement("p");
          smallText.innerHTML =
            "Minimum Amount: " + formatCurrency(minamount) + " " + currency;

          const breakline = document.createElement("br");

          const input1 = document.createElement("input");

          input1.addEventListener("keydown", (e) => {
            if (!isNumericInput(e)) {
              e.preventDefault();
            }
          });

          input1.style.outline = "none";
          input1.style.appearance = "none";
          input1.style.MozAppearance = "textfield";
          input1.placeholder = "Major Currency";
          input1.type = "number";
          input1.min = "0";
          input1.step = "1";
          input1.style.backgroundColor = "#2b4865";
          input1.style.border = "none";
          input1.style.padding = "10px";
          input1.style.color = "#fff";
          input1.style.fontSize = "16px";
          input1.style.marginBottom = "10px";
          input1.style.borderRadius = "4px";

          const input2 = document.createElement("input");

          input2.addEventListener("keydown", (e) => {
            if (!isNumericInput(e)) {
              e.preventDefault();
            }
          });

          input2.addEventListener("input", (e) => {
            const inputValue = parseInt(e.target.value, 10);
            if (inputValue > 99) {
              e.target.value = 99;
            }
          });

          input2.style.outline = "none";
          input2.style.appearance = "none";
          input2.style.MozAppearance = "textfield";
          input2.placeholder = "Minor Currency";
          input2.type = "number";
          input2.min = "0";
          input2.max = "99";
          input2.step = "1";
          input2.style.backgroundColor = "#2b4865";
          input2.style.border = "none";
          input2.style.padding = "10px";
          input2.style.color = "#fff";
          input2.style.fontSize = "16px";
          input2.style.marginBottom = "10px";
          input2.style.borderRadius = "4px";

          const button = document.createElement("button");
          button.textContent = "Add funds";

          const initialGradient =
            "linear-gradient(to bottom, rgb(121, 153, 5), rgb(83, 105, 4))";
          const hoverGradient =
            "linear-gradient(to bottom, rgb(164, 208, 7), rgb(107, 135, 5))";

          button.style.background = initialGradient;

          button.style.border = "none";
          button.style.padding = "10px 20px";

          const initialColor = "rgb(210, 232, 133)";
          const hoverColor = "rgb(255, 255, 255)";

          button.style.color = initialColor;

          button.addEventListener("mouseenter", () => {
            button.style.color = hoverColor;
            button.style.background = hoverGradient;
          });

          button.addEventListener("mouseleave", () => {
            button.style.color = initialColor;
            button.style.background = initialGradient;
          });

          button.style.fontSize = "16px";
          button.style.borderRadius = "4px";
          button.style.cursor = "pointer";

          const callAddFunds = () => {
            const value1 = parseInt(input1.value, 10);
            const value2 = parseInt(input2.value, 10);

            if (isNaN(value1)) {
              alert("Please enter valid positive numbers.");
              return;
            }

            if (value1 <= 0) {
              alert("Please enter a value greater then zero");
              return;
            }

            const value = appendNumbers(value1, isNaN(value2) ? 0 : value2);

            if (value < minamount) {
              alert(
                "Please enter a amount greater then or equal to minimum amount"
              );
              return;
            }

            addFunds(value, currency);
          };

          button.addEventListener("click", callAddFunds);

          container.appendChild(text);
          container.appendChild(smallText);
          container.appendChild(breakline);
          container.appendChild(input1);
          container.appendChild(input2);
          container.appendChild(button);

          let pricesUser = document.getElementById("prices_user");
          pricesUser.appendChild(container);
        } else {
          alert("Cannot find price's container");
        }
      }
    }

    if (settings.autoSkipAgeVerification) {
      if (
        window.location.href.startsWith(
          "https://store.steampowered.com/agecheck"
        )
      ) {
        let ageDayElement = document.getElementById("ageDay");
        if (ageDayElement !== null) {
          ageDayElement.value = "1";
        }

        let ageMonthElement = document.getElementById("ageMonth");
        if (ageMonthElement !== null) {
          ageMonthElement.value = "January";
        }

        let ageYearElement = document.getElementById("ageYear");
        if (ageYearElement !== null) {
          ageYearElement.value = "2000";
        }

        document.getElementById("view_product_page_btn").click();
      }
    }

    if (settings.showCurrentPlayers) {
      if (
        window.location.href.startsWith("https://store.steampowered.com/app/")
      ) {
        let appId = window.location.href.match(/\/app\/(\d+)\//)[1];
        let requestUrl =
          "https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v0001/?appid=" +
          appId;

        backgroundFetch(requestUrl)
          .then((frespone) => {
            let plramount = makeReadable(frespone.response.player_count);

            let appHubAppName = document.getElementById("appHubAppName");

            let paragraph = document.createElement("p");
            paragraph.textContent = `${plramount} players currently playing`;

            let breakLine = document.createElement("br");

            appHubAppName.parentNode.insertBefore(
              paragraph,
              appHubAppName.nextSibling
            );

            paragraph.insertAdjacentElement("afterend", breakLine);
          });
      }
    }

    if (settings.showDownloadButton) {
      if (
        window.location.href.startsWith("https://store.steampowered.com/app/")
      ) {
        let appId = window.location.href.match(/\/app\/(\d+)\//)[1];

        var dbtn = document.getElementsByClassName(
          "game_area_already_owned_btn"
        )[0];

        if (dbtn != null) {
          var actionList = document.getElementById("queueActionsCtn");

          const parentDiv = document.createElement("div");
          parentDiv.classList.add("queue_control_button");

          const childDiv = document.createElement("div");
          childDiv.classList.add("btnv6_blue_hoverfade", "btn_medium");

          const spanElement = document.createElement("span");

          spanElement.innerText = "Download in Steam";

          childDiv.appendChild(spanElement);

          parentDiv.appendChild(childDiv);

          actionList.prepend(parentDiv);

          parentDiv.addEventListener("click", () => {
            window.location.href = "steam://install/" + appId;
          });
        }
      }
    }

    if (settings.showProtonDBRating) {
      if (
        window.location.href.startsWith("https://store.steampowered.com/app/")
      ) {
        let appId = window.location.href.match(/\/app\/(\d+)\//)[1];
        let requestUrl =
          "https://www.protondb.com/api/v1/reports/summaries/" +
          appId +
          ".json";

        backgroundFetch(requestUrl)
          .then((frespone) => {
            const trending = frespone.trendingTier;
            const tier = frespone.tier;

            const reviews = document.querySelector(".user_reviews");

            const breakline = document.createElement("br");

            const tierElement = document.createElement("div");
            tierElement.innerHTML =
              'ProtonDB Tier: <span style="color: ' +
              getTierColor(tier) +
              '">' +
              tier +
              "</span>";

            const trendingElement = document.createElement("div");
            trendingElement.innerHTML =
              'ProtonDB Trending: <span style="color: ' +
              getTierColor(trending) +
              '">' +
              trending +
              "</span>";

            reviews.appendChild(breakline);
            reviews.appendChild(tierElement);
            reviews.appendChild(trendingElement);
          });
      }
    }
  })
  .catch((error) => {
    console.log(error);
    alert("Error occured");
  });
