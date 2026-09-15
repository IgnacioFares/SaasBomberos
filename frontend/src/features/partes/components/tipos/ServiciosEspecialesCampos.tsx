import { Box, Checkbox, FormControlLabel, Radio, RadioGroup, TextField, Typography } from '@mui/material'
import type { DatosServiciosEspeciales } from '../../types'

interface Props {
  value: DatosServiciosEspeciales
  onChange: (value: DatosServiciosEspeciales) => void
  disabled?: boolean
}

const ServiciosEspecialesCampos = ({ value, onChange, disabled }: Props) => {
  const check = (campo: keyof DatosServiciosEspeciales) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, [campo]: e.target.checked })

  return (
    <Box className="flex flex-col gap-4">
      <Box>
        <Typography variant="subtitle2" className="mb-1! font-semibold!">Subtipo</Typography>
        <RadioGroup row value={value.subtipo ?? ''} onChange={(e) => onChange({ ...value, subtipo: e.target.value as DatosServiciosEspeciales['subtipo'] })}>
          <FormControlLabel value="SERVICIO" control={<Radio size="small" disabled={disabled} />} label="Servicio" />
          <FormControlLabel value="REPRESENTACION" control={<Radio size="small" disabled={disabled} />} label="Representación" />
          <FormControlLabel value="PREVENCION" control={<Radio size="small" disabled={disabled} />} label="Prevención" />
        </RadioGroup>
      </Box>

      {value.subtipo === 'SERVICIO' && (
        <Box>
          <Typography variant="subtitle2" className="mb-1! font-semibold!">Información del servicio</Typography>
          <Typography variant="caption" color="text.secondary">Organización beneficiada</Typography>
          <Box className="flex flex-wrap items-center gap-1">
            <FormControlLabel control={<Checkbox checked={!!value.servOtrasFuerzas} disabled={disabled} onChange={check('servOtrasFuerzas')} />} label="Otras fuerzas" />
            <FormControlLabel control={<Checkbox checked={!!value.servEntidadesGubernamentales} disabled={disabled} onChange={check('servEntidadesGubernamentales')} />} label="Entidades gubernamentales" />
            <FormControlLabel control={<Checkbox checked={!!value.servEmpresaPrivada} disabled={disabled} onChange={check('servEmpresaPrivada')} />} label="Empresa privada" />
          </Box>
          <TextField
            label="Detalle"
            value={value.servDetalle ?? ''}
            onChange={(e) => onChange({ ...value, servDetalle: e.target.value })}
            disabled={disabled}
            fullWidth
            multiline
            minRows={2}
          />
        </Box>
      )}

      {value.subtipo === 'REPRESENTACION' && (
        <Box>
          <Typography variant="subtitle2" className="mb-1! font-semibold!">Tipo de representación</Typography>
          <Box className="flex flex-wrap items-center gap-1">
            <FormControlLabel control={<Checkbox checked={!!value.repDesfile} disabled={disabled} onChange={check('repDesfile')} />} label="Desfile" />
            <FormControlLabel control={<Checkbox checked={!!value.repHonoresFunebres} disabled={disabled} onChange={check('repHonoresFunebres')} />} label="Honores fúnebres" />
            <FormControlLabel control={<Checkbox checked={!!value.repAniversarios} disabled={disabled} onChange={check('repAniversarios')} />} label="Aniversarios" />
            <FormControlLabel control={<Checkbox checked={!!value.repEventosPublicos} disabled={disabled} onChange={check('repEventosPublicos')} />} label="Eventos públicos" />
            <FormControlLabel control={<Checkbox checked={!!value.repEventosPrivados} disabled={disabled} onChange={check('repEventosPrivados')} />} label="Eventos privados" />
            <FormControlLabel control={<Checkbox checked={!!value.repCeremonias} disabled={disabled} onChange={check('repCeremonias')} />} label="Ceremonias" />
            <FormControlLabel control={<Checkbox checked={!!value.repOtra} disabled={disabled} onChange={check('repOtra')} />} label="Otra" />
            {value.repOtra && (
              <TextField size="small" label="Detalle" value={value.repOtraDetalle ?? ''} onChange={(e) => onChange({ ...value, repOtraDetalle: e.target.value })} disabled={disabled} />
            )}
          </Box>
        </Box>
      )}

      {value.subtipo === 'PREVENCION' && (
        <Box>
          <Typography variant="subtitle2" className="mb-1! font-semibold!">Tipo de prevención</Typography>
          <Box className="flex flex-wrap items-center gap-1">
            <FormControlLabel control={<Checkbox checked={!!value.prevAterrizaje} disabled={disabled} onChange={check('prevAterrizaje')} />} label="Aterrizaje" />
            <FormControlLabel control={<Checkbox checked={!!value.prevDespegues} disabled={disabled} onChange={check('prevDespegues')} />} label="Despegues" />
            <FormControlLabel control={<Checkbox checked={!!value.prevEventos} disabled={disabled} onChange={check('prevEventos')} />} label="Eventos" />
            <FormControlLabel control={<Checkbox checked={!!value.prevFiesta} disabled={disabled} onChange={check('prevFiesta')} />} label="Fiesta" />
            <FormControlLabel control={<Checkbox checked={!!value.prevOtra} disabled={disabled} onChange={check('prevOtra')} />} label="Otra" />
            {value.prevOtra && (
              <TextField size="small" label="Detalle" value={value.prevOtraDetalle ?? ''} onChange={(e) => onChange({ ...value, prevOtraDetalle: e.target.value })} disabled={disabled} />
            )}
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default ServiciosEspecialesCampos
