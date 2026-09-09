(function () {
  "use strict";

  const form = document.getElementById("contact-form");
  const emailInput = document.getElementById("email");
  const emailError = document.getElementById("email-error");
  const statusEl = document.getElementById("form-status");
  const submitBtn = document.getElementById("submit-btn");

  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setEmailError(message) {
    const field = emailInput.closest(".field");
    if (message) {
      field.classList.add("is-invalid");
      emailError.hidden = false;
      emailError.textContent = message;
      emailInput.setAttribute("aria-invalid", "true");
    } else {
      field.classList.remove("is-invalid");
      emailError.hidden = true;
      emailError.textContent = "";
      emailInput.removeAttribute("aria-invalid");
    }
  }

  function setStatus(type, message) {
    if (!message) {
      statusEl.hidden = true;
      statusEl.textContent = "";
      statusEl.className = "form__status";
      return;
    }

    statusEl.hidden = false;
    statusEl.textContent = message;
    statusEl.className = "form__status is-" + type;
  }

  function validateEmail() {
    const value = emailInput.value.trim();

    if (!value) {
      setEmailError("Будь ласка, вкажіть Email — це обов’язкове поле.");
      return false;
    }

    if (!EMAIL_PATTERN.test(value)) {
      setEmailError("Вкажіть коректну адресу Email (наприклад, name@example.com).");
      return false;
    }

    setEmailError("");
    return true;
  }

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    submitBtn.classList.toggle("is-loading", isLoading);
  }

  emailInput.addEventListener("blur", validateEmail);
  emailInput.addEventListener("input", function () {
    if (emailInput.closest(".field").classList.contains("is-invalid")) {
      validateEmail();
    }
  });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    setStatus("", "");

    if (!validateEmail()) {
      emailInput.focus();
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData(form);
      const response = await fetch(form.action, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json().catch(function () {
        return { success: false, message: "Неочікувана відповідь сервера." };
      });

      if (!response.ok || !data.success) {
        if (data.field === "email") {
          setEmailError(data.message || "Помилка у полі Email.");
          emailInput.focus();
        }
        setStatus("error", data.message || "Не вдалося надіслати форму. Спробуйте ще раз.");
        return;
      }

      setStatus("success", data.message || "Форму успішно надіслано.");
      form.reset();
      setEmailError("");
    } catch (error) {
      setStatus(
        "error",
        "Помилка з’єднання з сервером. Перевірте, що Open Server запущено, і спробуйте знову."
      );
    } finally {
      setLoading(false);
    }
  });
})();
