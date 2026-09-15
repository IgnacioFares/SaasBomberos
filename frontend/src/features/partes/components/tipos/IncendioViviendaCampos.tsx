import { Box, Checkbox, FormControlLabel, TextField, Typography } from '@mui/material'
import type { DatosIncendioVivienda } from '../../types'

interface Props {
  value: DatosIncendioVivienda
  onChange: (value: DatosIncendioVivienda) => void
  disabled?: boolean
}

const IncendioViviendaCampos = ({ value, onChange, disabled }: Props) => {
  const check = (campo: keyof DatosIncendioVivienda) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, [campo]: e.target.checked })
  const texto = (campo: keyof DatosIncendioVivienda) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, [campo]: e.target.value })

  return (
    <Box className="flex flex-col gap-4">
      <Box>
        <Typography variant="subtitle2" className="mb-1! font-semibold!">Datos del seguro</Typography>
        <Box className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <TextField label="Compañía" value={value.seguroCompania ?? ''} onChange={texto('seguroCompania')} disabled={disabled} />
          <TextField label="N° de póliza" value={value.seguroPoliza ?? ''} onChange={texto('seguroPoliza')} disabled={disabled} />
          <TextField label="Vencimiento" type="date" value={value.seguroVencimiento ?? ''} onChange={texto('seguroVencimiento')} disabled={disabled} slotProps={{ inputLabel: { shrink: true } }} />
        </Box>
      </Box>

      <Box>
        <Typography variant="subtitle2" className="mb-1! font-semibold!">Tipo de lugar</Typography>
        <Box className="flex flex-wrap items-center gap-1">
          <FormControlLabel control={<Checkbox checked={!!value.tipoLugarCasa} disabled={disabled} onChange={check('tipoLugarCasa')} />} label="Casa" />
          <FormControlLabel control={<Checkbox checked={!!value.tipoLugarDepto} disabled={disabled} onChange={check('tipoLugarDepto')} />} label="Depto" />
          <FormControlLabel control={<Checkbox checked={!!value.tipoLugarCasilla} disabled={disabled} onChange={check('tipoLugarCasilla')} />} label="Casilla" />
          <FormControlLabel control={<Checkbox checked={!!value.tipoLugarRancho} disabled={disabled} onChange={check('tipoLugarRancho')} />} label="Rancho" />
          <FormControlLabel control={<Checkbox checked={!!value.tipoLugarMultifuncional} disabled={disabled} onChange={check('tipoLugarMultifuncional')} />} label="Multifuncional" />
          <FormControlLabel control={<Checkbox checked={!!value.tipoLugarOtro} disabled={disabled} onChange={check('tipoLugarOtro')} />} label="Otro" />
          {value.tipoLugarOtro && (
            <TextField size="small" label="Detalle" value={value.tipoLugarOtroDetalle ?? ''} onChange={texto('tipoLugarOtroDetalle')} disabled={disabled} />
          )}
        </Box>
      </Box>

      <Box>
        <Typography variant="subtitle2" className="mb-1! font-semibold!">Tipo de techo</Typography>
        <Box className="flex flex-wrap items-center gap-1">
          <FormControlLabel control={<Checkbox checked={!!value.techoMaderaPaja} disabled={disabled} onChange={check('techoMaderaPaja')} />} label="Madera-paja" />
          <FormControlLabel control={<Checkbox checked={!!value.techoYeso} disabled={disabled} onChange={check('techoYeso')} />} label="Yeso" />
          <FormControlLabel control={<Checkbox checked={!!value.techoTejas} disabled={disabled} onChange={check('techoTejas')} />} label="Tejas" />
          <FormControlLabel control={<Checkbox checked={!!value.techoChapaMetalica} disabled={disabled} onChange={check('techoChapaMetalica')} />} label="Chapa metálica" />
          <FormControlLabel control={<Checkbox checked={!!value.techoChapaCarton} disabled={disabled} onChange={check('techoChapaCarton')} />} label="Chapa cartón" />
        </Box>
      </Box>

      <Box>
        <Typography variant="subtitle2" className="mb-1! font-semibold!">Tipo de abertura</Typography>
        <Box className="flex flex-wrap items-center gap-1">
          <FormControlLabel control={<Checkbox checked={!!value.aberturaMadera} disabled={disabled} onChange={check('aberturaMadera')} />} label="Madera" />
          <FormControlLabel control={<Checkbox checked={!!value.aberturaAceroHierro} disabled={disabled} onChange={check('aberturaAceroHierro')} />} label="Acero-Hierro" />
          <FormControlLabel control={<Checkbox checked={!!value.aberturaAluminio} disabled={disabled} onChange={check('aberturaAluminio')} />} label="Aluminio" />
          <FormControlLabel control={<Checkbox checked={!!value.aberturaPlastico} disabled={disabled} onChange={check('aberturaPlastico')} />} label="Plástico" />
          <FormControlLabel control={<Checkbox checked={!!value.aberturaOtro} disabled={disabled} onChange={check('aberturaOtro')} />} label="Otro" />
          {value.aberturaOtro && (
            <TextField size="small" label="Detalle" value={value.aberturaOtroDetalle ?? ''} onChange={texto('aberturaOtroDetalle')} disabled={disabled} />
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default IncendioViviendaCampos
