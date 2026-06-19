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

const backgroundFetch = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    const payload = {
      action: options.action || "fetchData",
      url,
      options,
      meta: options.meta || {},
    };

    if (typeof browser !== "undefined" && browser.runtime) {
      browser.runtime.sendMessage(payload, (response) => {
        if (response && response.success) {
          resolve(response.data);
        } else {
          reject(response?.error || "Unknown error");
        }
      });
    } else if (typeof chrome !== "undefined" && chrome.runtime) {
      chrome.runtime.sendMessage(payload, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError.message);
        } else if (response && response.success) {
          resolve(response.data);
        } else {
          reject(response?.error || "Unknown error");
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

function symbolizeCurrency(amount, currencyCode) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(amount);
}

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
        const appId = window.location.href.match(/\/app\/(\d+)\//)[1];

        const fallback = !document.querySelector(
          'meta[itemprop="priceCurrency"]',
        );

        (async () => {
          try {
            const mapRes = await backgroundFetch(
              `https://api.isthereanydeal.com/games/lookup/v1?appid=${appId}`,
              { action: "itadFetch" },
            );

            if (!mapRes?.found || !mapRes?.game?.id) return;

            const itadId = mapRes.game.id;

            const priceRes = await backgroundFetch(
              `https://api.isthereanydeal.com/games/overview/v2`,
              {
                action: "itadFetch",
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify([itadId]),
              },
            );

            const gamePrices = priceRes?.prices?.[0];
            if (!gamePrices) return;

            const lowest = gamePrices.lowest;

            const element = document.querySelector(".game_area_purchase");
            if (!element) return;

            const div = document.createElement("div");
            div.classList.add("game_area_purchase_game");

            const h1 = document.createElement("h1");
            h1.textContent = `Lowest recorded price: ${symbolizeCurrency(lowest.price.amount, lowest.price.currency)} (${lowest.cut}% off)`;

            const p = document.createElement("p");

            const date = new Date(lowest.timestamp);

            const months = [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ];

            p.innerText = `Recorded around ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;

            div.appendChild(h1);
            div.appendChild(p);

            if (fallback) {
              const p2 = document.createElement("p");
              p2.innerText =
                "Currency detection failed, showing default pricing.";
              div.appendChild(p2);
            }

            element.insertBefore(div, element.firstChild);
          } catch (err) {
            console.error("ITAD error:", err);
          }
        })();
      }
    }

    if (settings.addCustomFunds) {
      if (
        window.location.href.startsWith(
          "https://store.steampowered.com/steamaccount/addfunds",
        )
      ) {
        const element = document.querySelector("a.btnv6_green_white_innerfade");

        if (element) {
          const minamount = parseInt(element.getAttribute("data-amount"), 10);
          const currency = element.getAttribute("data-currency");

          const container = document.createElement("div");
          container.style.cssText =
            "background: linear-gradient(to right, rgb(44, 60, 74), rgb(87, 102, 116)); padding: 20px; border-radius: 6px; box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.6); width: 250px; margin: 0 auto; text-align: center;";

          const text = document.createElement("h1");
          text.innerText = "Add custom funds";
          text.style.cssText = "color: #fff; font-size: 18px; margin-top: 0;";

          const input = document.createElement("input");
          input.type = "number";
          input.step = "0.01";
          input.placeholder = "0.00";
          input.style.cssText =
            "width: 80%; background: #2b4865; border: none; padding: 10px; color: #fff; margin-bottom: 10px; border-radius: 4px; font-size: 16px;";

          const button = document.createElement("button");
          button.textContent = "Add funds";
          button.style.cssText =
            "background: linear-gradient(to bottom, rgb(121, 153, 5), rgb(83, 105, 4)); color: rgb(210, 232, 133); border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; width: 100%; font-size: 16px;";

          button.onclick = () => {
            const total = Math.round(parseFloat(input.value) * 100);

            if (isNaN(total) || total < minamount) {
              alert(
                "Please enter a valid amount (Minimum: " +
                  (minamount / 100).toFixed(2) +
                  " " +
                  currency +
                  ")",
              );
            } else {
              addFunds(total, currency);
            }
          };

          container.appendChild(text);
          container.appendChild(input);
          container.appendChild(button);

          const pricesUser = document.getElementById("prices_user");
          if (pricesUser) {
            pricesUser.appendChild(container);
          }
        }
      }
    }

    if (settings.autoSkipAgeVerification) {
      if (
        window.location.href.startsWith(
          "https://store.steampowered.com/agecheck",
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

        backgroundFetch(requestUrl).then((frespone) => {
          let plramount = makeReadable(frespone.response.player_count);

          let appHubAppName = document.getElementById("appHubAppName");

          let paragraph = document.createElement("p");
          paragraph.textContent = `${plramount} players currently playing`;

          let breakLine = document.createElement("br");

          appHubAppName.parentNode.insertBefore(
            paragraph,
            appHubAppName.nextSibling,
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
          "game_area_already_owned_btn",
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

        backgroundFetch(requestUrl).then((frespone) => {
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
