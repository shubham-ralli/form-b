(() => {
  window.FormCraft = {
    render: function (formId, containerId) {
      const container = document.getElementById(containerId);
      if (!container) {
        console.error("FormCraft: Container element not found");
        return;
      }

      // Show loading state
      container.innerHTML =
        '<div style="text-align: center; padding: 20px;">Loading form...</div>';

      // Determine the API URL
      let apiUrl = container.dataset.apiUrl;

      if (!apiUrl) {
        // Try to detect if we're in development or production
        if (
          window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1"
        ) {
          apiUrl =
            "https://63454937-214e-4451-b30c-3180aaf162f8-00-1gp0zrilxanc1.pike.replit.dev";
        } else if (
          window.location.protocol === "file:" ||
          window.location.protocol === "https:" ||
          window.location.protocol === "http:"
        ) {
          // Handle file:// protocol for local testing
          apiUrl =
            "https://63454937-214e-4451-b30c-3180aaf162f8-00-1gp0zrilxanc1.pike.replit.dev";
          container.innerHTML = `
            <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <h4 style="margin: 0 0 8px 0; color: #92400e;">⚠️ Local File Detected</h4>
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                To test this form, please:
                <br>1. Make sure your FormCraft server is running on http://localhost:3000
                <br>2. Or serve this HTML file through a web server instead of opening it directly
              </p>
            </div>
          `;
          // Still try to load the form
        } else {
          apiUrl = window.location.origin;
        }
      }

      // Fetch form configuration
      fetch(`${apiUrl}/api/forms/${formId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((formConfig) => {
          if (formConfig.error) {
            container.innerHTML = `<div style="color: red; padding: 20px;">Form not found: ${formConfig.error}</div>`;
            return;
          }

          if (!formConfig.isActive) {
            container.innerHTML = `
              <div style="text-align: center; padding: 40px; color: #ef4444; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px;">
                <div style="font-size: 48px; margin-bottom: 16px;">🚫</div>
                <h3 style="margin: 0 0 8px 0; color: #dc2626;">Form Inactive</h3>
                <p style="margin: 0; color: #dc2626;">This form is currently not active and cannot receive submissions.</p>
              </div>
            `;
            return;
          }

          // Generate form HTML
          const formHTML = this.generateFormHTML(formConfig, apiUrl);
          container.innerHTML = formHTML;

          // Add event listener for form submission
          const form = container.querySelector("form");
          if (form) {
            form.addEventListener("submit", (e) =>
              this.handleSubmit(e, formConfig, apiUrl),
            );
          }
        })
        .catch((error) => {
          console.error("FormCraft: Error loading form", error);

          let errorMessage = "Error loading form";
          if (error.message.includes("Failed to fetch")) {
            errorMessage = `
              <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 16px; border-radius: 8px;">
                <h4 style="margin: 0 0 8px 0; color: #dc2626;">Connection Error</h4>
                <p style="margin: 0; color: #dc2626; font-size: 14px;">
                  Cannot connect to FormCraft server at: <code>${apiUrl}</code>
                  <br><br>Please ensure:
                  <br>• The FormCraft server is running
                  <br>• The API URL is correct
                  <br>• CORS is properly configured
                </p>
              </div>
            `;
          }

          container.innerHTML = `<div style="padding: 20px;">${errorMessage}</div>`;
        });
    },

    generateFormHTML: function (formConfig, apiUrl) {
      let html = `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="margin-bottom: 20px; color: #333; text-align: center;">${formConfig.title}</h2>
          <form id="formcraft-form-${formConfig.id}" style="display: flex; flex-wrap: wrap; gap: 16px;">
      `;

      formConfig.elements.forEach((element) => {
        html += this.generateElementHTML(element);
      });

      html += `
            <button type="submit" style="
              background: #3b82f6;
              color: white;
              padding: 12px 24px;
              border: none;
              border-radius: 6px;
              font-size: 16px;
              cursor: pointer;
              margin-top: 20px;
              transition: background-color 0.2s;
              width: 100%;
            " onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">
              Submit Form
            </button>
          </form>
        </div>
      `;

      return html;
    },

    generateElementHTML: (element) => {
      const labelHTML = `<label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151; font-size: 14px;">${element.label}${element.required ? ' <span style="color: #ef4444;">*</span>' : ""}</label>`;
      const inputStyle =
        "width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 16px; box-sizing: border-box; font-family: inherit;";
      const elementWrapperStyle = `margin-bottom: 0; ${element.width === "w-1/2" ? "flex: 0 0 calc(50% - 8px);" : "width: 100%;"}`; // Apply width here

      switch (element.type) {
        case "text":
        case "email":
          return `
            <div style="${elementWrapperStyle}">
              ${labelHTML}
              <input type="${element.type}" name="${element.id}" placeholder="${element.placeholder || ""}" ${element.required ? "required" : ""} style="${inputStyle}">
            </div>
          `;

        case "textarea":
          return `
            <div style="${elementWrapperStyle}">
              ${labelHTML}
              <textarea name="${element.id}" placeholder="${element.placeholder || ""}" ${element.required ? "required" : ""} style="${inputStyle} min-height: 100px; resize: vertical;"></textarea>
            </div>
          `;

        case "select":
          let selectHTML = `
            <div style="${elementWrapperStyle}">
              ${labelHTML}
              <select name="${element.id}" ${element.required ? "required" : ""} style="${inputStyle}">
                <option value="">Select an option</option>
          `;
          if (element.options) {
            element.options.forEach((option) => {
              selectHTML += `<option value="${option}">${option}</option>`;
            });
          }
          selectHTML += `</select></div>`;
          return selectHTML;

        case "radio":
          let radioHTML = `<div style="${elementWrapperStyle}">${labelHTML}<div style="display: flex; flex-direction: column; gap: 8px;">`;
          if (element.options) {
            element.options.forEach((option, index) => {
              radioHTML += `
                <label style="display: flex; align-items: center; font-weight: normal; cursor: pointer;">
                  <input type="radio" name="${element.id}" value="${option}" ${element.required ? "required" : ""} style="margin-right: 8px;">
                  <span>${option}</span>
                </label>
              `;
            });
          }
          radioHTML += `</div></div>`;
          return radioHTML;

        case "checkbox":
          return `
            <div style="${elementWrapperStyle}">
              <label style="display: flex; align-items: center; font-weight: 500; color: #374151; cursor: pointer;">
                <input type="checkbox" name="${element.id}" value="true" ${element.required ? "required" : ""} style="margin-right: 8px;">
                <span>${element.label}</span>
              </label>
            </div>
          `;

        default:
          return "";
      }
    },

    handleSubmit: (event, formConfig, apiUrl) => {
      event.preventDefault();

      const form = event.target;
      const submitButton = form.querySelector('button[type="submit"]');
      const originalText = submitButton.textContent;

      // Show loading state
      submitButton.textContent = "Submitting...";
      submitButton.disabled = true;

      const formData = new FormData(form);
      const data = {};

      // Convert FormData to regular object
      for (const [key, value] of formData.entries()) {
        if (data[key]) {
          // Handle multiple values (like checkboxes)
          if (Array.isArray(data[key])) {
            data[key].push(value);
          } else {
            data[key] = [data[key], value];
          }
        } else {
          data[key] = value;
        }
      }

      // Submit to FormCraft API
      fetch(`${apiUrl}/api/submissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formId: formConfig.id,
          data: data,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((result) => {
          // Handle post-submission behavior
          if (
            formConfig.submissionType === "redirect" &&
            formConfig.redirectUrl
          ) {
            window.location.href = formConfig.redirectUrl;
          } else {
            // Default to message or use custom HTML
            const successMessage =
              formConfig.successMessageHtml ||
              `
              <div style="text-align: center; padding: 40px; color: #059669;">
                <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
                <h3 style="margin: 0 0 8px 0; color: #059669;">Thank you!</h3>
                <p style="margin: 0; color: #6b7280;">Your form has been submitted successfully.</p>
              </div>
            `;
            form.parentElement.innerHTML = successMessage;
          }
        })
        .catch((error) => {
          console.error("FormCraft: Submission error", error);

          // Reset button state
          submitButton.textContent = originalText;
          submitButton.disabled = false;

          // Show error message
          let errorDiv = form.querySelector(".error-message");
          if (!errorDiv) {
            errorDiv = document.createElement("div");
            errorDiv.className = "error-message";
            errorDiv.style.cssText =
              "color: #ef4444; background: #fef2f2; padding: 12px; border-radius: 6px; margin-bottom: 16px; border: 1px solid #fecaca;";
            form.insertBefore(errorDiv, form.firstChild);
          }
          errorDiv.textContent =
            "There was an error submitting the form. Please try again.";
        });
    },
  };

  // Auto-initialize if data attributes are present
  document.addEventListener("DOMContentLoaded", () => {
    const containers = document.querySelectorAll("[data-formcraft-id]");
    containers.forEach((container) => {
      const formId = container.getAttribute("data-formcraft-id");
      if (formId && container.id) {
        window.FormCraft.render(formId, container.id);
      }
    });
  });
})();
