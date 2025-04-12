export const generateHTMLReport = ({
    userName,
    userEmail,
    aiReportText,
    imageUrls = [],
    date,
    doctorRemarks = null
  }) => {
    return `
    <html>
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');
  
          body {
            font-family: 'Roboto', sans-serif;
            background-color: #ffffff;
            color: #000000;
            padding: 40px;
            font-size: 14px;
          }
  
          h1 {
            color: #e9b08a;
            text-align: center;
            font-size: 28px;
            margin-bottom: 30px;
          }
  
          .info-box {
            border: 2px solid #e9b08a;
            padding: 20px;
            margin-bottom: 30px;
            border-radius: 8px;
          }
  
          .section-title {
            font-size: 18px;
            color: #e9b08a;
            margin-top: 30px;
            border-bottom: 1px solid #e9b08a;
            padding-bottom: 5px;
          }
  
          .summary {
            margin-top: 15px;
            line-height: 1.6;
          }
  
          .image-container {
            margin-top: 30px;
            page-break-inside: avoid;
          }
  
          .image-container img {
            display: block;
            margin: 10px auto;
            max-width: 80%;
            border: 1px solid #ddd;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <h1>Dermatology Report</h1>
  
        <div class="info-box">
          <p><strong>Patient Name:</strong> ${userName}</p>
          <p><strong>Email:</strong> ${userEmail}</p>
          <p><strong>Date:</strong> ${date}</p>
        </div>
  
        <div class="section-title">AI Generated Summary</div>
        <div class="summary">${aiReportText}</div>
  
        
  
        ${imageUrls.map(url => `
          <div class="section-title">Uploaded Image</div>
          <div class="image-container">
            <img src="${url}" />
          </div>
        `).join('')}

        ${doctorRemarks ? `
          <div class="section-title">Doctor's Remarks</div>
          <div class="summary">${doctorRemarks}</div>
        ` : ''}
      </body>
    </html>
    `;
  };
  