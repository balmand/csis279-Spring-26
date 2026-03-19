import { useState } from 'react';

export const useFormFields = (initialState) => {
  const [fields, setFields] = useState(initialState);

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFields((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const resetFields = () => {
    setFields(initialState);
  };

  return {
    fields,
    setFields,
    handleFieldChange,
    resetFields,
  };
};
