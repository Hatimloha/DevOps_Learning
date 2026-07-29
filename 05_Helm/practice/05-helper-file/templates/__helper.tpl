{{- define "frontend.name" -}}
nginx-app
{{- end -}}

{{- define "frontend-namespace" -}}
frontend
{{- end -}}

{{- define "myapp.fullname" -}}
{{ .Release.Name }}-{{ .Chart.Name}} 
{{- end -}}