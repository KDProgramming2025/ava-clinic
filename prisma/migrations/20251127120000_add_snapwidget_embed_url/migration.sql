DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_name = 'Settings'
			AND column_name = 'snapWidgetEmbedUrl'
	) THEN
		ALTER TABLE "Settings"
			ADD COLUMN "snapWidgetEmbedUrl" TEXT;
	END IF;
END $$;
