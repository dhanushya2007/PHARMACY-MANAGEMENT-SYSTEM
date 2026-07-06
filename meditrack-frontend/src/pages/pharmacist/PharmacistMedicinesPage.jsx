import React from 'react';
import MedicinesPage from '../admin/MedicinesPage';

// Pharmacists use the same list component but without create/delete permissions if restricted,
// or simple read-only access. Here we can reuse the Admin's page but hide Admin actions if needed.
export default function PharmacistMedicinesPage() {
  return <MedicinesPage />;
}
