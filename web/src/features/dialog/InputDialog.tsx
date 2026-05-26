import { Button, Group, Modal, Stack } from '@mantine/core';
import React from 'react';
import { useNuiEvent } from '../../hooks/useNuiEvent';
import { useLocales } from '../../providers/LocaleProvider';
import { fetchNui } from '../../utils/fetchNui';
import type { InputProps } from '../../typings';
import { OptionValue } from '../../typings';
import InputField from './components/fields/input';
import CheckboxField from './components/fields/checkbox';
import SelectField from './components/fields/select';
import NumberField from './components/fields/number';
import SliderField from './components/fields/slider';
import { useFieldArray, useForm } from 'react-hook-form';
import ColorField from './components/fields/color';
import DateField from './components/fields/date';
import TextareaField from './components/fields/textarea';
import TimeField from './components/fields/time';
import dayjs from 'dayjs';

export type FormValues = {
  test: {
    value: any;
  }[];
};

const InputDialog: React.FC = () => {
  const [fields, setFields] = React.useState<InputProps>({
    heading: '',
    rows: [{ type: 'input', label: '' }],
  });
  const [visible, setVisible] = React.useState(false);
  const { locale } = useLocales();

  const form = useForm<{ test: { value: any }[] }>({});
  const fieldForm = useFieldArray({
    control: form.control,
    name: 'test',
  });

  useNuiEvent<InputProps>('openDialog', (data) => {
    setFields(data);
    setVisible(true);
    data.rows.forEach((row, index) => {
      fieldForm.insert(index, {
        value:
          row.type !== 'checkbox'
            ? row.type === 'date' || row.type === 'date-range' || row.type === 'time'
              ? row.default === true
                ? new Date().getTime()
                : Array.isArray(row.default)
                ? row.default.map((date) => new Date(date).getTime())
                : row.default
                ? new Date(row.default).getTime()
                : null
              : row.default
            : row.checked,
      });
      // Backwards compat with new Select data type
      if (row.type === 'select' || row.type === 'multi-select') {
        row.options = row.options.map((option) =>
          !option.label ? { ...option, label: option.value } : option
        ) as Array<OptionValue>;
      }
    });
  });

  useNuiEvent('closeInputDialog', async () => await handleClose(true));

  const handleClose = async (dontPost?: boolean) => {
    setVisible(false);
    await new Promise((resolve) => setTimeout(resolve, 200));
    form.reset();
    fieldForm.remove();
    if (dontPost) return;
    fetchNui('inputData');
  };

  const onSubmit = form.handleSubmit(async (data) => {
    setVisible(false);
    const values: any[] = [];
    for (let i = 0; i < fields.rows.length; i++) {
      const row = fields.rows[i];

      if ((row.type === 'date' || row.type === 'date-range') && row.returnString) {
        if (!data.test[i]) continue;
        data.test[i].value = dayjs(data.test[i].value).format(row.format || 'DD/MM/YYYY');
      }
    }
    Object.values(data.test).forEach((obj: { value: any }) => values.push(obj.value));
    await new Promise((resolve) => setTimeout(resolve, 200));
    form.reset();
    fieldForm.remove();
    fetchNui('inputData', values);
  });

  return (
    <>
      {visible && (
        <div
          className="customModalOverlay"
          onClick={(e) => {
            e.stopPropagation();
            // if (fields.options?.allowCancel !== false) {
            //   handleClose();
            // }
          }}
        >
          <div className="customModalContent" onClick={(e) => e.stopPropagation()}>
            <div className="topCont">
              <h2 className="customModalTitle">{fields.heading}</h2>

              <h3 className="customModalheader">Palun täida kõik vajalikud väljad.</h3>
            </div>

            <form onSubmit={onSubmit}>
              <div className="customModalBody">
                {fieldForm.fields.map((item, index) => {
                  const row = fields.rows[index];
                  return (
                    <React.Fragment key={item.id}>
                      {row.type === 'input' && (
                        <InputField
                          register={form.register(`test.${index}.value`, { required: row.required })}
                          row={row}
                          index={index}
                        />
                      )}
                      {row.type === 'checkbox' && (
                        <CheckboxField
                          register={form.register(`test.${index}.value`, { required: row.required })}
                          row={row}
                          index={index}
                        />
                      )}
                      {(row.type === 'select' || row.type === 'multi-select') && (
                        <SelectField row={row} index={index} control={form.control} />
                      )}
                      {row.type === 'number' && <NumberField control={form.control} row={row} index={index} />}
                      {row.type === 'slider' && <SliderField control={form.control} row={row} index={index} />}
                      {row.type === 'color' && <ColorField control={form.control} row={row} index={index} />}
                      {row.type === 'time' && <TimeField control={form.control} row={row} index={index} />}
                      {row.type === 'date' || row.type === 'date-range' ? (
                        <DateField control={form.control} row={row} index={index} />
                      ) : null}
                      {row.type === 'textarea' && (
                        <TextareaField
                          register={form.register(`test.${index}.value`, { required: row.required })}
                          row={row}
                          index={index}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              <div className="customModalButtons">
                <button
                  type="button"
                  className="cancelButton2"
                  onClick={() => handleClose()}
                  disabled={fields.options?.allowCancel === false}
                >
                  {locale.ui.cancel}
                </button>

                <button type="submit" className="confirmButton2">
                  {locale.ui.confirm}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default InputDialog;
