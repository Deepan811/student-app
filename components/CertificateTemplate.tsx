'use client';

import React from 'react';
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  Font,
} from '@react-pdf/renderer';

// --- FONT REGISTRATION (RECOMMENDED) ---
// To match the fonts, you should register them.
// The original used a bold, all-caps font for the name.
/*
Font.register({
  family: 'MyBoldFont', 
  src: '/fonts/MyBoldFont.ttf',
  fontWeight: 'bold',
});
Font.register({
  family: 'MyBodyFont', 
  src: '/fonts/MyBodyFont.ttf' 
});
*/
// -------------------------------------------

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  textContainer: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    textAlign: 'center',
    alignItems: 'center',
  },
  presentedTo: {
    fontSize: 14,
    fontFamily: 'Helvetica',
    color: '#333333',
    marginBottom: 20, // Increased gap
  },
  nameContainer: {
    borderBottom: '1px dotted #000000',
    paddingBottom: 5,
    marginBottom: 10, // Reduced space
  },
  name: {
    fontSize: 40, // Increased size
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#000000',
  },
  details: {
    fontSize: 14,
    fontFamily: 'Helvetica',
    color: '#333333',
    lineHeight: 1.5,
    width: '70%', // Changed from maxWidth to fixed width
    marginBottom: 5, // Reduced space
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
  },
});

// === Main Component ===
const CertificateTemplate = ({
  studentName,
  collegeName,
  courseName,
  startDate,
  endDate,
  certificateId,
}) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.container}>
        <Image src="http://localhost:3000/blank-tf-certificate.jpg" style={styles.backgroundImage} />
        <View style={styles.textContainer}>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>
              {studentName || 'KISHORE KARTHICK S'}
            </Text>
          </View>
          <Text style={styles.details}>
            STUDENT OF <Text style={styles.bold}>{collegeName || 'DHANALAKSHMI SRINIVASAN COLLEGE'}</Text>
          </Text>
          <Text style={styles.details}>
            HAS COMPLETED AN <Text style={styles.bold}>INTERNSHIP TRAINING</Text> IN
          </Text>
          <Text style={[styles.details, styles.bold, { fontSize: 16 }]}>
            {courseName || 'FULL STACK DEVELOPMENT'}
          </Text>
          <Text style={styles.details}>
            FROM <Text style={styles.bold}>{startDate || '27-01-2025'}</Text> TO <Text style={styles.bold}>{endDate || '11-02-2025'}</Text>
          </Text>
        </View>
      </View>
    </Page>
  </Document>
);

export default CertificateTemplate;